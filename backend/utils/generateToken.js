import jwt from "jsonwebtoken";

const generateToken = (res, userId, role) => {
  // Generate JWT token
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Store JWT in an HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
};

export default generateToken;