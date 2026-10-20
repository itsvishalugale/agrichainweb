import express from "express"
import {
  createBatch,
  updateProcessor,
  updateWarehouse,
  updateRetailer,
  markAsSold,
  getBatchById,
  getAllBatches,
  getMyBatches,
} from "../controllers/batchController.js"
import { protect } from "../middleware/authMiddleware.js"
import allowRoles from "../middleware/roleMiddleware.js"

const router = express.Router()



// -----------------------------------------------
// Protected routes — login required
// -----------------------------------------------

// Farmer only
router.post(
  "/create",
  protect,
  allowRoles("farmer"),
  createBatch
)

router.get(
  "/my-batches",
  protect,
  allowRoles("farmer"),
  getMyBatches
)




// Processor only
router.put(
  "/processor/:batchId",
  protect,
  allowRoles("processor"),
  updateProcessor
)

// Warehouse only
router.put(
  "/warehouse/:batchId",
  protect,
  allowRoles("warehouse"),
  updateWarehouse
)

// Retailer only
router.put(
  "/retailer/:batchId",
  protect,
  allowRoles("retailer"),
  updateRetailer
)

router.put(
  "/retailer/:batchId/sold",
  protect,
  allowRoles("retailer"),
  markAsSold
)

// Admin only
router.get(
  "/admin/all",
  protect,
  allowRoles("admin"),
  getAllBatches
)

// -----------------------------------------------
// Public route — no login needed
// Consumer scans QR → gets batchId → hits this
// -----------------------------------------------
router.get("/:batchId", getBatchById)

export default router