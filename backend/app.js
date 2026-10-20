import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/authRoutes.js"
import batchRoutes from "./routes/batchRoutes.js"
import listingRoutes from "./routes/listingRoutes.js"
import chatRoutes    from "./routes/chatRoutes.js"
import orderRoutes   from "./routes/orderRoutes.js"

const app = express()

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/batch", batchRoutes)
app.use("/api/listings", listingRoutes)
app.use("/api/chat",     chatRoutes)
app.use("/api/orders",   orderRoutes)

// Test route
app.get("/", (req, res) => {
  res.json({ message: "🌱 AgriChain Backend is running!" })
})

export default app