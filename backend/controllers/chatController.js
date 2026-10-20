import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import Listing from "../models/Listing.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"

// ─────────────────────────────────────────────
// START OR GET CONVERSATION
// POST /api/chat/start
// Buyer starts chat about a listing ✅
// ─────────────────────────────────────────────
export const startConversation = asyncHandler(async (req, res) => {
  const { listingId } = req.body

  if (!listingId) {
    throw new ApiError(400, "Listing ID is required")
  }

  // Find the listing
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw new ApiError(404, "Listing not found")
  }

  if (listing.status !== "active") {
    throw new ApiError(400, "This listing is no longer active")
  }

  // Buyer cannot chat with themselves
  if (listing.farmerId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot chat about your own listing")
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    listingId,
    buyerId: req.user._id
  })

  if (conversation) {
    // Return existing conversation
    // No duplicate conversations ✅
    return res.status(200).json(
      new ApiResponse(200, { conversation }, "Existing conversation found")
    )
  }

  // Create new conversation
  conversation = await Conversation.create({
    listingId,
    farmerId:     listing.farmerId,
    buyerId:      req.user._id,
    cropName:     listing.cropName,
    listingPrice: listing.pricePerKg,
  })

  // Send welcome system message
  await Message.create({
    conversationId: conversation._id,
    senderId:       req.user._id,
    senderName:     req.user.name,
    senderRole:     "buyer",
    message: `Hi! I am interested in your ${listing.cropName} listing (${listing.quantity} ${listing.quantityUnit} @ ₹${listing.pricePerKg}/kg). Can we discuss?`,
    type: "text"
  })

  res.status(201).json(
    new ApiResponse(201, { conversation }, "Conversation started")
  )
})

// ─────────────────────────────────────────────
// GET MY CONVERSATIONS
// GET /api/chat/conversations
// Farmer sees all chats about their listings
// Buyer sees all their chats ✅
// ─────────────────────────────────────────────
export const getMyConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const role   = req.user.role

  // Find conversations where user is farmer OR buyer
  const conversations = await Conversation.find({
    $or: [
      { farmerId: userId },
      { buyerId:  userId }
    ]
  })
  .populate("farmerId", "name rating")
  .populate("buyerId",  "name rating buyerType")
  .populate("listingId", "cropName pricePerKg quantity")
  .sort({ lastMessageAt: -1 })
  // Most recent chat at top ✅

  res.status(200).json(
    new ApiResponse(
      200,
      { total: conversations.length, conversations },
      "Conversations fetched"
    )
  )
})

// ─────────────────────────────────────────────
// GET MESSAGES IN A CONVERSATION
// GET /api/chat/:conversationId/messages
// Both farmer and buyer can see ✅
// ─────────────────────────────────────────────
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params

  // Verify user is part of this conversation
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    throw new ApiError(404, "Conversation not found")
  }

  const userId = req.user._id.toString()
  const isParticipant =
    conversation.farmerId.toString() === userId ||
    conversation.buyerId.toString()  === userId

  if (!isParticipant) {
    throw new ApiError(403, "You are not part of this conversation")
  }

  // Fetch messages
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
  // Oldest first (chronological order) ✅

  // Mark messages as read
  // Messages sent by OTHER person → mark as read
  await Message.updateMany(
    {
      conversationId,
      senderId: { $ne: req.user._id },
      // $ne = not equal → messages NOT sent by me
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  )

  // Reset unread count for this user
  if (req.user.role === "farmer") {
    conversation.farmerUnread = 0
  } else {
    conversation.buyerUnread = 0
  }
  await conversation.save()

  res.status(200).json(
    new ApiResponse(
      200,
      { messages, conversation },
      "Messages fetched"
    )
  )
})

// ─────────────────────────────────────────────
// SEND MESSAGE
// POST /api/chat/:conversationId/send
// Both farmer and buyer can send ✅
// ─────────────────────────────────────────────
export const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const { message, type, offeredPrice } = req.body

  if (!message) {
    throw new ApiError(400, "Message cannot be empty")
  }

  // Verify conversation and participation
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    throw new ApiError(404, "Conversation not found")
  }

  const userId = req.user._id.toString()
  const isFarmer = conversation.farmerId.toString() === userId
  const isBuyer  = conversation.buyerId.toString()  === userId

  if (!isFarmer && !isBuyer) {
    throw new ApiError(403, "Not part of this conversation")
  }

  // Determine receiver
  const receiverId = isFarmer
    ? conversation.buyerId
    : conversation.farmerId

  // Create message in MongoDB
  const newMessage = await Message.create({
    conversationId,
    senderId:   req.user._id,
    senderName: req.user.name,
    senderRole: req.user.role,
    message,
    type:         type || "text",
    offeredPrice: type === "price_offer" ? offeredPrice : undefined,
    // Only save offeredPrice for price_offer messages
  })

  // Update conversation last message
  conversation.lastMessage   = message
  conversation.lastMessageAt = new Date()
  conversation.lastSenderId  = req.user._id

  // Increase unread count for receiver
  if (isFarmer) {
    conversation.buyerUnread += 1
  } else {
    conversation.farmerUnread += 1
  }

  await conversation.save()

  // Socket.io sends message instantly to receiver
  // This is handled in the socket utility
  // Frontend emits socket event after this API call

  res.status(201).json(
    new ApiResponse(
      201,
      {
        message: newMessage,
        receiverId
        // Frontend uses receiverId to emit socket event
      },
      "Message sent"
    )
  )
})

// ─────────────────────────────────────────────
// ACCEPT PRICE OFFER
// PUT /api/chat/:conversationId/accept-price
// Only farmer can accept price offer ✅
// ─────────────────────────────────────────────
export const acceptPriceOffer = asyncHandler(async (req, res) => {
  const { conversationId } = req.params
  const { offeredPrice }   = req.body

  const conversation = await Conversation.findById(conversationId)
  if (!conversation) {
    throw new ApiError(404, "Conversation not found")
  }

  // Only farmer can accept
  if (conversation.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only farmer can accept price offers")
  }

  // Update conversation with agreed price
  conversation.agreedPrice = offeredPrice
  conversation.isAgreed    = true
  await conversation.save()

  // Send acceptance message
  await Message.create({
    conversationId,
    senderId:   req.user._id,
    senderName: req.user.name,
    senderRole: "farmer",
    message:    `✅ I accept ₹${offeredPrice}/kg. Please place your order!`,
    type:       "price_accepted",
    offeredPrice,
  })

  res.status(200).json(
    new ApiResponse(
      200,
      { agreedPrice: offeredPrice },
      `Price of ₹${offeredPrice}/kg accepted!`
    )
  )
})