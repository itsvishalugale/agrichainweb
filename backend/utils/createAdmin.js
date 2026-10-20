import mongoose from "mongoose"
import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()

const createAdmin = async () => {
  try {
    // Step 1 — check all env variables exist
    if (
      !process.env.ADMIN_NAME ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD
    ) {
      console.error("❌ ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD missing in .env")
      process.exit(1)
    }

    // Step 2 — connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB Connected")

    // Step 3 — check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      console.log("⚠️ Admin already exists!")
      console.log(`Email: ${existingAdmin.email}`)
      process.exit(0)
    }

    // Step 4 — create admin from .env values
    const admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      // pre("save") hook hashes password automatically ✅
      role: "admin",
    })

    console.log("✅ Admin created successfully!")
    console.log(`Name  : ${admin.name}`)
    console.log(`Email : ${admin.email}`)
    console.log(`Role  : ${admin.role}`)
    process.exit(0)

  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

createAdmin()