import mongoose from "mongoose"

// -----------------------------------------------
// Farmer Stage Schema
// -----------------------------------------------
const farmerStageSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  farmerName: { type: String },
  village: { type: String },
  cropName: {
    type: String,
    required: [true, "Crop name is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
  },
  quantityUnit: {
    type: String,
    enum: ["kg", "quintal", "ton"],
    default: "kg",
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  harvestDate: {
    type: Date,
    required: [true, "Harvest date is required"],
  },
  pesticideUsed: {
    type: String,
    default: "None",
  },
  cropImage: {
    type: String,
    default: "",
  },
  completedAt: { type: Date },
})

// -----------------------------------------------
// Processor Stage Schema
// -----------------------------------------------
const processorStageSchema = new mongoose.Schema({
  processorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  processorName: { type: String },
  facilityName: { type: String },
  processingDate: { type: Date },
  packagingType: {
    type: String,
    enum: ["box", "bag", "crate", "loose"],
  },
  qualityGrade: {
    type: String,
    enum: ["A", "B", "C"],
  },
  additionalNotes: {
    type: String,
    default: "",
  },
  completedAt: { type: Date },
})

// -----------------------------------------------
// Warehouse Stage Schema
// -----------------------------------------------
const warehouseStageSchema = new mongoose.Schema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  warehouseName: { type: String },
  storageType: {
    type: String,
    enum: ["cold", "dry", "humid"],
  },
  entryDate: { type: Date },
  expectedExitDate: { type: Date },
  storageLocation: { type: String },
  temperature: {
    type: String,
    default: "Not recorded",
  },
  completedAt: { type: Date },
})

// -----------------------------------------------
// Retailer Stage Schema
// -----------------------------------------------
const retailerStageSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  retailerName: { type: String },
  storeName: { type: String },
  receivedDate: { type: Date },
  retailPrice: { type: Number },
  shelfLocation: { type: String },
  expiryDate: { type: Date },
  isSold: {
    type: Boolean,
    default: false,
  },
  completedAt: { type: Date },
})

// -----------------------------------------------
// Timeline Entry Schema
// Every stage update adds one entry here
// Each entry has its OWN blockchain hash ✅
// -----------------------------------------------
const timelineSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ["farmer", "processor", "warehouse", "retailer"],
  },
  message: { type: String },
  updatedBy: { type: String },
  // name of person who updated

  blockchainHash: {
    type: String,
    default: "",
    // hash of THIS specific stage transaction
    // links to etherscan for verification
    // EVERY stage gets its own hash ✅
  },

  blockchainStatus: {
    type: String,
    enum: ["pending", "confirmed", "failed"],
    default: "pending",
    // pending   → transaction submitted to blockchain
    // confirmed → ethereum confirmed the transaction
    // failed    → transaction failed (retry needed)
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
})

// -----------------------------------------------
// Main Batch Schema
// -----------------------------------------------
const batchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      unique: true,
    },

    currentStage: {
      type: String,
      enum: ["farmer", "processor", "warehouse", "retailer", "completed"],
      default: "farmer",
    },

    // Each role has their own stage object
    farmer: { type: farmerStageSchema, default: {} },
    processor: { type: processorStageSchema, default: {} },
    warehouse: { type: warehouseStageSchema, default: {} },
    retailer: { type: retailerStageSchema, default: {} },

    // QR code image URL
    // generated after farmer creates batch
    qrCode: {
      type: String,
      default: "",
    },

    // Latest blockchain hash for quick access
    // Full history is in timeline array ✅
    latestBlockchainHash: {
      type: String,
      default: "",
    },

    // Complete history of all stages
    // Each entry has its OWN hash
    // This is the PROOF of entire journey ✅
    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  }
)

// -----------------------------------------------
// Auto generate batchId before saving
// -----------------------------------------------
batchSchema.pre("save", async function () {
  if (!this.batchId) {
    const year = new Date().getFullYear()
    const count = await mongoose.model("Batch").countDocuments()
    const paddedCount = String(count + 1).padStart(4, "0")
    this.batchId = `BATCH-${year}-${paddedCount}`
  }
})

const Batch = mongoose.model("Batch", batchSchema)

export default Batch