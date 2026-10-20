import Order from "../models/Order.js"
import Listing from "../models/Listing.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { createRazorpayOrder, verifyPaymentSignature } from "../utils/razorpay.js"
import { recordOnBlockchain } from "../utils/blockchain.js"
import { getIO } from "../utils/socket.js"

// ─────────────────────────────────────────────
// INITIATE ORDER + CREATE RAZORPAY ORDER
// POST /api/orders/initiate
// Only buyer ✅
// ─────────────────────────────────────────────
export const initiateOrder = asyncHandler(async (req, res) => {
  const {
    listingId,
    quantity,
    deliveryAddress,
    conversationId,
    negotiatedPrice,
    // If price was negotiated in chat
  } = req.body

  // Step 1 — Validate
  if (!listingId || !quantity || !deliveryAddress) {
    throw new ApiError(400, "listingId, quantity, deliveryAddress required")
  }

  // Step 2 — Find listing
  const listing = await Listing.findById(listingId)
  if (!listing) {
    throw new ApiError(404, "Listing not found")
  }

  if (listing.status !== "active") {
    throw new ApiError(400, "Listing is no longer available")
  }

  // Step 3 — Check quantity available
  if (quantity > listing.availableQuantity) {
    throw new ApiError(
      400,
      `Only ${listing.availableQuantity} ${listing.quantityUnit} available`
    )
  }

  if (quantity < listing.minOrderKg) {
    throw new ApiError(
      400,
      `Minimum order is ${listing.minOrderKg} ${listing.quantityUnit}`
    )
  }

  // Step 4 — Determine final price
  let finalPrice = listing.pricePerKg
  // Default to listing price

  if (conversationId && negotiatedPrice) {
    // Check if price was actually agreed in chat
    const conversation = await Conversation.findById(conversationId)
    if (conversation?.isAgreed && conversation?.agreedPrice) {
      finalPrice = conversation.agreedPrice
      // Use negotiated price from chat ✅
    }
  }

  const totalAmount = quantity * finalPrice

  // Step 5 — Create Razorpay order
  const razorpayOrder = await createRazorpayOrder(
    totalAmount,
    `agrichain_${Date.now()}`
  )
  // This gives us razorpayOrder.id
  // Frontend uses this to open payment window

  // Step 6 — Create pending order in MongoDB
  const order = await Order.create({
    listingId,
    batchId:   listing.batchId,
    cropName:  listing.cropName,

    buyerId:    req.user._id,
    buyerName:  req.user.name,
    buyerPhone: req.user.phone,
    buyerType:  req.user.buyerType,

    farmerId:   listing.farmerId,
    farmerName: listing.farmerName,

    quantity,
    pricePerKg:  finalPrice,
    totalAmount,

    deliveryAddress,
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    // Default 7 days delivery

    negotiatedInChat: !!conversationId,
    conversationId:   conversationId || null,

    payment: {
      razorpayOrderId: razorpayOrder.id,
      amount:          totalAmount,
      status:          "pending"
    },

    status: "pending"
  })

  res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId:          order._id,
        razorpayOrderId:  razorpayOrder.id,
        razorpayKeyId:    process.env.RAZORPAY_KEY_ID,
        // Frontend needs key to initialize Razorpay ✅
        amount:           totalAmount,
        currency:         "INR",
        cropName:         listing.cropName,
        quantity,
        pricePerKg:       finalPrice,
      },
      "Order initiated. Complete payment to confirm."
    )
  )
})

// ─────────────────────────────────────────────
// VERIFY PAYMENT AND CONFIRM ORDER
// POST /api/orders/verify-payment
// Only buyer ✅
// ─────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body

  // Step 1 — Verify payment signature
  // This is the CRITICAL security check
  const isValid = verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  )

  if (!isValid) {
    throw new ApiError(400, "Payment verification failed! Invalid signature")
    // Someone tried to fake payment ❌
  }

  // Step 2 — Find order
  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, "Order not found")
  }

  // Step 3 — Update payment status
  order.payment.razorpayPaymentId = razorpayPaymentId
  order.payment.razorpaySignature = razorpaySignature
  order.payment.status            = "paid"
  order.payment.paidAt            = new Date()
  order.status                    = "confirmed"

  // Step 4 — Update listing available quantity
  const listing = await Listing.findById(order.listingId)
  if (listing) {
    listing.quantitySold      += order.quantity
    listing.availableQuantity -= order.quantity

    // Mark listing as sold if fully sold
    if (listing.availableQuantity <= 0) {
      listing.status = "sold"
    }
    await listing.save()
  }

  // Step 5 — Record on blockchain
  const { txHash } = await recordOnBlockchain(
    order.batchId,
    "purchase",
    req.user.name,
    `direct_purchase_${order.quantity}kg`,
    {
      orderId:    order._id.toString(),
      buyerName:  order.buyerName,
      farmerName: order.farmerName,
      quantity:   order.quantity,
      amount:     order.totalAmount,
    }
  )

  order.blockchainHash = txHash
  await order.save()

  // Step 6 — Update conversation status
  if (order.conversationId) {
    await Conversation.findByIdAndUpdate(
      order.conversationId,
      { status: "ordered", orderId: order._id }
    )

    // Add system message to chat
    await Message.create({
      conversationId: order.conversationId,
      senderId:       req.user._id,
      senderName:     "System",
      senderRole:     "buyer",
      message: `🎉 Order placed! ${order.quantity}kg × ₹${order.pricePerKg} = ₹${order.totalAmount}. Payment confirmed ✅`,
      type: "order_placed"
    })
  }

  // Step 7 — Notify farmer via Socket.io
  const io = getIO()
  io.to(order.farmerId.toString()).emit("newOrderNotification", {
    message:  `🎉 New order from ${order.buyerName}!`,
    orderId:  order._id,
    cropName: order.cropName,
    quantity: order.quantity,
    amount:   order.totalAmount,
  })

  res.status(200).json(
    new ApiResponse(
      200,
      { order },
      "Payment verified! Order confirmed successfully 🎉"
    )
  )
})

// ─────────────────────────────────────────────
// GET MY ORDERS (Buyer)
// GET /api/orders/my-orders
// Only buyer ✅
// ─────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("listingId", "cropName location")

  res.status(200).json(
    new ApiResponse(
      200,
      { total: orders.length, orders },
      "Your orders fetched"
    )
  )
})

// ─────────────────────────────────────────────
// GET FARMER ORDERS
// GET /api/orders/farmer-orders
// Only farmer ✅
// ─────────────────────────────────────────────
export const getFarmerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ farmerId: req.user._id })
    .sort({ createdAt: -1 })

  res.status(200).json(
    new ApiResponse(
      200,
      { total: orders.length, orders },
      "Farmer orders fetched"
    )
  )
})

// ─────────────────────────────────────────────
// UPDATE ORDER STATUS (Farmer)
// PUT /api/orders/:orderId/status
// Farmer updates: confirmed → processing → shipped
// ─────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const { orderId } = req.params

  const allowedStatuses = ["processing", "shipped", "delivered"]
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowedStatuses.join(", ")}`)
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, "Order not found")
  }

  if (order.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the farmer can update order status")
  }

  order.status = status
  await order.save()

  // Notify buyer via socket
  const io = getIO()
  io.to(order.buyerId.toString()).emit("orderStatusUpdate", {
    orderId: order._id,
    status,
    message: `Your order is now ${status}! 📦`,
  })

  res.status(200).json(
    new ApiResponse(200, { order }, `Order status updated to ${status}`)
  )
})

// ─────────────────────────────────────────────
// RATE ORDER
// POST /api/orders/:orderId/rate
// Both buyer and farmer can rate ✅
// ─────────────────────────────────────────────
export const rateOrder = asyncHandler(async (req, res) => {
  const { rating, review } = req.body
  const { orderId }        = req.params

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5")
  }

  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, "Order not found")
  }

  if (order.status !== "delivered") {
    throw new ApiError(400, "Can only rate after delivery")
  }

  const isBuyer  = order.buyerId.toString()  === req.user._id.toString()
  const isFarmer = order.farmerId.toString() === req.user._id.toString()

  if (!isBuyer && !isFarmer) {
    throw new ApiError(403, "Not part of this order")
  }

  if (isBuyer) {
    order.farmerRating = { rating, review, givenAt: new Date() }
    // Buyer rates farmer
  } else {
    order.buyerRating = { rating, review, givenAt: new Date() }
    // Farmer rates buyer
  }

  await order.save()

  res.status(200).json(
    new ApiResponse(200, {}, "Rating submitted successfully")
  )
})
