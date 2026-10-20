import mongoose from "mongoose"

// -----------------------------------------------
// Order = When buyer purchases from farmer
// Created after chat negotiation
// Payment via Razorpay sandbox
// -----------------------------------------------
const orderSchema = new mongoose.Schema(
  {
    // ─── What was ordered ───
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    batchId: {
      type: String,
      // Copy from listing for easy reference
    },
    cropName: { type: String },

    // ─── Who is involved ───
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerName:  { type: String },
    buyerPhone: { type: String },
    buyerType:  { type: String },
    // restaurant/hotel/individual etc

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerName: { type: String },

    // ─── Order quantities and price ───
    quantity:   {
      type: Number,
      required: true,
    },
    pricePerKg: {
      type: Number,
      required: true,
      // This is the NEGOTIATED price
      // May be different from listing price
      // If buyer and farmer agreed ₹83 in chat
      // instead of listed ₹85
      // This stores ₹83 ✅
    },
    totalAmount: {
      type: Number,
      required: true,
      // quantity × pricePerKg
      // Calculated before saving
    },

    // ─── Delivery details ───
    deliveryAddress:  { type: String },
    expectedDelivery: { type: Date },
    deliveryNotes:    { type: String },

    // ─── Order status journey ───
    status: {
      type: String,
      enum: [
        "pending",     // buyer placed order, waiting farmer
        "confirmed",   // farmer accepted
        "processing",  // farmer packing/preparing
        "shipped",     // dispatched for delivery
        "delivered",   // buyer received
        "cancelled",   // cancelled by either party
        "disputed"     // dispute raised
      ],
      default: "pending",
    },

    // Track who cancelled and why
    cancelledBy:     { type: String },
    cancellationReason: { type: String },

    // ─── Razorpay Payment ───
    payment: {
      razorpayOrderId: {
        type: String,
        // ID created by Razorpay before payment
        // Sent to frontend to open payment window
      },
      razorpayPaymentId: {
        type: String,
        // ID received after successful payment
        // Unique for every payment
      },
      razorpaySignature: {
        type: String,
        // Cryptographic signature from Razorpay
        // We verify this to confirm payment is genuine
        // Not a fake request ✅
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending",
      },
      paidAt: { type: Date },
      // When payment was made
      amount: { type: Number },
      // In rupees (Razorpay gives paise, we convert)
    },

    // ─── Was price negotiated in chat? ───
    negotiatedInChat: {
      type: Boolean,
      default: false,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      // Link to the chat where price was negotiated
      // Full negotiation history available ✅
    },

    // ─── Blockchain record ───
    blockchainHash: {
      type: String,
      // Purchase recorded on Ethereum
      // Permanent proof of transaction ✅
    },

    // ─── Ratings after delivery ───
    farmerRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String },
      givenAt: { type: Date },
    },
    buyerRating: {
      rating: { type: Number, min: 1, max: 5 },
      review: { type: String },
      givenAt: { type: Date },
    },
    // Farmer rates buyer — did they pay on time?
    // Buyer rates farmer — was crop as described?
  },
  { timestamps: true }
)

// ─── Calculate total before saving ───
orderSchema.pre("save", function () {
  if (this.quantity && this.pricePerKg) {
    this.totalAmount = this.quantity * this.pricePerKg
    // Auto calculate so no human error ✅
  }
})

const Order = mongoose.model("Order", orderSchema)
export default Order