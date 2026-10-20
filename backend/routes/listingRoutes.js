import express from "express"
import {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListingPrice,
  cancelListing,
  getMandiPricesForCrop,
} from "../controllers/listingController.js"
import { protect } from "../middleware/authMiddleware.js"
import allowRoles from "../middleware/roleMiddleware.js"

const router = express.Router()

// Public — anyone logged in can browse marketplace
router.get("/",              protect, getAllListings)
router.get("/mandi-prices",  protect, getMandiPricesForCrop)
router.get("/:id",           protect, getListingById)

// Farmer only
router.post("/create",       protect, allowRoles("farmer"), createListing)
router.get("/my/listings",   protect, allowRoles("farmer"), getMyListings)
router.put("/:id/price",     protect, allowRoles("farmer"), updateListingPrice)
router.put("/:id/cancel",    protect, allowRoles("farmer"), cancelListing)

export default router