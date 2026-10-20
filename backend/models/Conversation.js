import mongoose from "mongoose"

// -----------------------------------------------
// Conversation = Chat room between farmer and buyer
// Created when buyer clicks "Negotiate with Farmer"
// One conversation per (buyer + listing) pair
// -----------------------------------------------
const conversationSchema = new mongoose.Schema(
  {
    // ─── What this chat is about ───
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      // Chat is always about a specific listing
      // Not random chat between users ✅
    },

    // ─── Who is chatting ───
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ─── Quick preview info ───
    cropName:     { type: String },
    listingPrice: { type: Number },
    // Original listing price

    // ─── Negotiation status ───
    agreedPrice: {
      type: Number,
      default: null,
      // null = still negotiating
      // number = price both agreed on
      // Set when buyer sends price offer
      // and farmer accepts it ✅
    },
    isAgreed: {
      type: Boolean,
      default: false,
      // true = price agreed, ready to order
    },

    // ─── Last message preview ───
    // Used in conversation list view
    lastMessage:   { type: String },
    lastMessageAt: { type: Date },
    lastSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ─── Unread counts ───
    farmerUnread: { type: Number, default: 0 },
    buyerUnread:  { type: Number, default: 0 },
    // Increases when new message arrives
    // Resets when they open chat ✅

    // ─── Status ───
    status: {
      type: String,
      enum: ["active", "ordered", "closed"],
      default: "active",
      // ordered = order placed from this chat
      // closed = conversation ended
    },

    // ─── Order created from this chat ───
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      // Set when order is placed
      // Links conversation to the order ✅
    },
  },
  { timestamps: true }
)

// ─── Ensure one conversation per buyer+listing ───
conversationSchema.index(
  { listingId: 1, buyerId: 1 },
  { unique: true }
)
// If buyer tries to start another chat
// about same listing → returns existing chat
// No duplicate conversations ✅

const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation