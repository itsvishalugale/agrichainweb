import mongoose from "mongoose"

// -----------------------------------------------
// Listing = Farmer's crop available for sale
// Created by farmer from their verified batch
// Buyer browses these listings on marketplace
// -----------------------------------------------
const listingSchema = new mongoose.Schema(
  {
    // ─── Link to blockchain verified batch ───
    batchId: {
      type: String,
      required: [true, "Batch ID is required"],
      // Listing MUST be linked to a real batch
      // This is what makes it blockchain verified ✅
    },

    // ─── Farmer details ───
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerName:   { type: String },
    farmerRating: { type: Number, default: 0 },
    farmerPhone:  { type: String },
    // Buyer sees farmer rating before deciding to buy

    // ─── Crop details (auto filled from batch) ───
    cropName:     {
      type: String,
      required: [true, "Crop name is required"]
    },
    qualityGrade: {
      type: String,
      enum: ["A", "B", "C"],
      // Pulled from blockchain verified batch
      // Buyer can trust this grade ✅
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"]
    },
    quantityUnit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      default: "kg"
    },
    availableQuantity: {
      type: Number,
      // Reduces as orders come in
      // quantity - sum of all orders
    },
    location:     { type: String },
    village:      { type: String },
    harvestDate:  { type: Date },
    pesticide:    { type: String, default: "None" },

    // ─── Listing specific details ───
    pricePerKg: {
      type: Number,
      required: [true, "Price is required"],
      // Farmer sets this based on mandi prices
    },
    minOrderKg: {
      type: Number,
      default: 10,
      // Minimum 10kg per order
      // Farmer doesn't want to pack 1kg boxes
    },
    maxOrderKg: {
      type: Number,
      // Optional maximum per order
    },
    availableTill: {
      type: Date,
      // Listing expires after this date
      // Crop cannot be sold after expiry
    },
    description: {
      type: String,
      // Farmer writes about their crop
      // "Freshly harvested Alphonso mangoes
      //  from my 5 acre farm in Devgad"
    },

    // ─── Blockchain proof ───
    blockchainHash: {
      type: String,
      // Transaction hash from original batch creation
      // Buyer clicks "Verify on Etherscan" ✅
    },
    blockchainVerified: {
      type: Boolean,
      default: true,
      // All listings are blockchain verified
      // because they come from verified batches
    },

    // ─── Listing status ───
    status: {
      type: String,
      enum: ["active", "sold", "expired", "cancelled"],
      default: "active",
    },

    // Track how much sold
    quantitySold: {
      type: Number,
      default: 0,
      // Increases as orders come in
    },

    // Total views — farmer sees how popular listing is
    views: { type: Number, default: 0 },

  },
  { timestamps: true }
)

// ─── Auto expire listings ───
// When listing is fetched check if past availableTill
listingSchema.methods.checkExpiry = function () {
  if (this.availableTill && new Date() > this.availableTill) {
    this.status = "expired"
    this.save()
  }
}

const Listing = mongoose.model("Listing", listingSchema)
export default Listing