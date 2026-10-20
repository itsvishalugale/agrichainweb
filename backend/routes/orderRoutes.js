import express from "express"
import {
  initiateOrder,
  verifyPayment,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  rateOrder,
} from "../controllers/orderController.js"
import { protect } from "../middleware/authMiddleware.js"
import allowRoles from "../middleware/roleMiddleware.js"

const router = express.Router()

// Buyer routes
router.post(
  "/initiate",
  protect,
  allowRoles("buyer"),
  initiateOrder
)

router.post(
  "/verify-payment",
  protect,
  allowRoles("buyer"),
  verifyPayment
)

router.get(
  "/my-orders",
  protect,
  allowRoles("buyer"),
  getMyOrders
)

// Farmer routes
router.get(
  "/farmer-orders",
  protect,
  allowRoles("farmer"),
  getFarmerOrders
)

router.put(
  "/:orderId/status",
  protect,
  allowRoles("farmer"),
  updateOrderStatus
)

// Both can rate
router.post(
  "/:orderId/rate",
  protect,
  allowRoles("buyer", "farmer"),
  rateOrder
)

export default router