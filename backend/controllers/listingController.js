import Listing from "../models/Listing.js"
import Batch from "../models/Batch.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { getMandiPrices, getPriceStats } from "../utils/mandiPrice.js"

// ─────────────────────────────────────────────
// CREATE LISTING
// POST /api/listings/create
// Only farmer can do this ✅
// ─────────────────────────────────────────────
export const createListing = asyncHandler(async (req, res) => {
  const {
    batchId,
    pricePerKg,
    minOrderKg,
    maxOrderKg,
    availableTill,
    description,
  } = req.body

  // Step 1 — Check required fields
  if (!batchId || !pricePerKg) {
    throw new ApiError(400, "Batch ID and price are required")
  }

  // Step 2 — Find the batch
  const batch = await Batch.findOne({ batchId })
  if (!batch) {
    throw new ApiError(404, "Batch not found")
  }

  // Step 3 — Verify batch belongs to this farmer
  if (batch.farmer.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only list your own batches")
  }

  // Step 4 — Check batch is at farmer stage
  // Cannot list a batch that's already processed
  if (batch.currentStage !== "farmer") {
    throw new ApiError(
      400,
      `Batch is at ${batch.currentStage} stage. Only batches at farmer stage can be listed`
    )
  }

  // Step 5 — Check no existing active listing for this batch
  const existingListing = await Listing.findOne({
    batchId,
    status: "active"
  })
  if (existingListing) {
    throw new ApiError(400, "Active listing already exists for this batch")
  }

  // Step 6 — Create listing from batch data
  const listing = await Listing.create({
    batchId,
    farmerId:     req.user._id,
    farmerName:   req.user.name,
    farmerRating: req.user.rating?.average || 0,

    // Auto fill from blockchain verified batch
    cropName:     batch.farmer.cropName,
    qualityGrade: batch.processor?.qualityGrade || null,
    quantity:     batch.farmer.quantity,
    quantityUnit: batch.farmer.quantityUnit,
    availableQuantity: batch.farmer.quantity,
    // Available = full quantity initially
    location:     batch.farmer.location,
    village:      batch.farmer.village,
    harvestDate:  batch.farmer.harvestDate,
    pesticide:    batch.farmer.pesticideUsed,

    // Listing specific
    pricePerKg,
    minOrderKg:   minOrderKg || 10,
    maxOrderKg:   maxOrderKg || batch.farmer.quantity,
    availableTill: availableTill
      ? new Date(availableTill)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // Default 30 days if not specified

    description,

    // Blockchain proof from batch
    blockchainHash:     batch.latestBlockchainHash,
    blockchainVerified: true,
  })

  res.status(201).json(
    new ApiResponse(201, { listing }, "Listing created successfully")
  )
})

// ─────────────────────────────────────────────
// GET ALL ACTIVE LISTINGS (Marketplace)
// GET /api/listings
// Any logged in user can see ✅
// ─────────────────────────────────────────────
export const getAllListings = asyncHandler(async (req, res) => {
  const {
    crop,
    minPrice,
    maxPrice,
    location,
    grade,
    sortBy
  } = req.query
  // Query params for filtering:
  // /api/listings?crop=Mango&maxPrice=100&grade=A

  // Build filter object dynamically
  const filter = { status: "active" }

  if (crop) {
    filter.cropName = { $regex: crop, $options: "i" }
    // $regex = search by partial name
    // $options: "i" = case insensitive
    // "mango" finds "Mango", "MANGO", "Alphonso Mango" ✅
  }

  if (grade)    filter.qualityGrade = grade
  if (location) filter.location = { $regex: location, $options: "i" }

  if (minPrice || maxPrice) {
    filter.pricePerKg = {}
    if (minPrice) filter.pricePerKg.$gte = Number(minPrice)
    if (maxPrice) filter.pricePerKg.$lte = Number(maxPrice)
    // $gte = greater than or equal
    // $lte = less than or equal ✅
  }

  // Sort options
  let sort = { createdAt: -1 }
  // Default newest first

  if (sortBy === "price_low")  sort = { pricePerKg: 1 }
  if (sortBy === "price_high") sort = { pricePerKg: -1 }
  if (sortBy === "rating")     sort = { farmerRating: -1 }

  const listings = await Listing.find(filter)
    .sort(sort)
    .limit(50)
  // Max 50 listings per request

  // Increment view count is not needed here
  // Only when single listing is viewed

  res.status(200).json(
    new ApiResponse(
      200,
      { total: listings.length, listings },
      "Listings fetched successfully"
    )
  )
})

// ─────────────────────────────────────────────
// GET SINGLE LISTING WITH MANDI PRICES
// GET /api/listings/:id
// Any logged in user ✅
// ─────────────────────────────────────────────
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("farmerId", "name rating phone village")
  // populate = replace farmerId with actual user data
  // only get name, rating, phone, village

  if (!listing) {
    throw new ApiError(404, "Listing not found")
  }

  // Increment view count
  listing.views += 1
  await listing.save()

  // Fetch live mandi prices for this crop
  const mandiPrices = await getMandiPrices(
    listing.cropName,
    listing.location?.split(",")[0]?.trim() || "Maharashtra"
    // Extract state from location string
  )

  const priceStats = getPriceStats(mandiPrices)
  // { average, highest, lowest, count }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        listing,
        mandiPrices,
        priceStats,
        // Frontend shows these next to listing price
        // "Mandi avg: ₹82 | This listing: ₹85 (Direct farm)" ✅
      },
      "Listing fetched successfully"
    )
  )
})

// ─────────────────────────────────────────────
// GET MY LISTINGS (Farmer)
// GET /api/listings/my-listings
// Only farmer ✅
// ─────────────────────────────────────────────
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({
    farmerId: req.user._id
  }).sort({ createdAt: -1 })

  res.status(200).json(
    new ApiResponse(
      200,
      { total: listings.length, listings },
      "Your listings fetched"
    )
  )
})

// ─────────────────────────────────────────────
// UPDATE LISTING PRICE
// PUT /api/listings/:id/price
// Only the farmer who created it ✅
// ─────────────────────────────────────────────
export const updateListingPrice = asyncHandler(async (req, res) => {
  const { pricePerKg } = req.body

  if (!pricePerKg) {
    throw new ApiError(400, "New price is required")
  }

  const listing = await Listing.findById(req.params.id)
  if (!listing) {
    throw new ApiError(404, "Listing not found")
  }

  if (listing.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own listings")
  }

  listing.pricePerKg = pricePerKg
  await listing.save()

  res.status(200).json(
    new ApiResponse(200, { listing }, "Price updated successfully")
  )
})

// ─────────────────────────────────────────────
// CANCEL LISTING
// PUT /api/listings/:id/cancel
// Only farmer ✅
// ─────────────────────────────────────────────
export const cancelListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)

  if (!listing) {
    throw new ApiError(404, "Listing not found")
  }

  if (listing.farmerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only cancel your own listings")
  }

  listing.status = "cancelled"
  await listing.save()

  res.status(200).json(
    new ApiResponse(200, {}, "Listing cancelled")
  )
})

// ─────────────────────────────────────────────
// GET MANDI PRICES FOR A CROP
// GET /api/listings/mandi-prices?crop=Mango
// Any user including farmer while negotiating ✅
// ─────────────────────────────────────────────
export const getMandiPricesForCrop = asyncHandler(async (req, res) => {
  const { crop, state } = req.query

  if (!crop) {
    throw new ApiError(400, "Crop name is required")
  }

  const prices = await getMandiPrices(crop, state)
  const stats  = getPriceStats(prices)

  res.status(200).json(
    new ApiResponse(
      200,
      { prices, stats },
      `Mandi prices for ${crop}`
    )
  )
})