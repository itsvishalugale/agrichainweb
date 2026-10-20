import mongoose from "mongoose"

// -----------------------------------------------
// Message = Individual chat message
// Stored in MongoDB for history
// Delivered instantly via Socket.io ✅
// -----------------------------------------------
const messageSchema = new mongoose.Schema(
  {
    // ─── Which conversation ───
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // ─── Who sent it ───
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: { type: String },
    senderRole: { type: String },
    // "farmer" or "buyer"
    // Frontend shows different bubble colors ✅

    // ─── Message content ───
    message: { type: String },

    // ─── Message type ───
    type: {
      type: String,
      enum: [
        "text",         // normal message
        "price_offer",  // buyer formally offers price
        "price_accepted", // farmer accepts price offer
        "price_rejected", // farmer rejects price offer
        "order_placed", // system: order was placed
        "system"        // other system messages
      ],
      default: "text",
    },

    // ─── For price offer messages ───
    offeredPrice: {
      type: Number,
      // When buyer sends price_offer
      // "I offer ₹80/kg"
      // offeredPrice = 80
    },

    // ─── Read status ───
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: { type: Date },

  },
  { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema)
export default Message