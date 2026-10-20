import Razorpay from "razorpay"
import crypto from "crypto"

// -----------------------------------------------
// Razorpay handles payment processing
// We use sandbox (test mode) — completely free
// Real money is never charged ✅
// -----------------------------------------------

// Initialize Razorpay with our credentials
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ─── Step 1: Create order before payment ───
// Frontend needs this to open payment window
export const createRazorpayOrder = async (amount, receipt) => {
  try {
    const options = {
      amount:   Math.round(amount * 100),
      // Razorpay works in PAISE not rupees
      // ₹500 = 50000 paise
      // Math.round prevents floating point issues ✅
      currency: "INR",
      receipt:  receipt || `order_${Date.now()}`,
      // receipt = our internal reference
      // helps track which order this payment is for
      notes: {
        platform: "AgriChain",
        type:     "Direct Farm Purchase"
      }
    }

    const order = await razorpay.orders.create(options)
    return order
    // order.id → send to frontend
    // frontend uses this to open Razorpay popup

  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`)
  }
}

// ─── Step 2: Verify payment after success ───
// MOST IMPORTANT STEP
// Without this anyone could fake a payment ✅
export const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  // Create our own signature using secret key
  const body = razorpayOrderId + "|" + razorpayPaymentId

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex")

  // Compare our signature with Razorpay's
  const isValid = expectedSignature === razorpaySignature

  return isValid
  // true  → payment is 100% genuine ✅
  // false → someone tried to fake payment ❌
}

export default razorpay

// ─── HOW PAYMENT FLOW WORKS ───
// ──────────────────────────────
// Step 1: Buyer clicks "Place Order"
//         Backend creates Razorpay order
//         Gets razorpayOrderId
//         Sends to frontend
//
// Step 2: Frontend opens Razorpay popup
//         Buyer enters test card:
//         4111 1111 1111 1111
//         Any CVV, any future date
//
// Step 3: Razorpay processes "payment"
//         Sends back:
//         → razorpayPaymentId
//         → razorpaySignature
//
// Step 4: Frontend sends these to backend
//
// Step 5: Backend verifies signature
//         If valid → mark order as paid
//         Record on blockchain
//         Notify farmer via socket ✅