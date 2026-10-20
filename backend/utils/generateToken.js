import jwt from "jsonwebtoken"

const generateToken = (res, userId, role) => {
  // generate token
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  // save token in httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    // JS cannot access this cookie ✅

    secure: process.env.NODE_ENV === "production",
    // secure: true → only send cookie over HTTPS
    // in development we use HTTP so keep it false
    // in production it becomes true automatically

    sameSite: "strict",
    // strict → cookie only sent to same site
    // prevents CSRF attacks ✅

    maxAge: 7 * 24 * 60 * 60 * 1000,
    // 7 days in milliseconds
    // 7 days × 24 hours × 60 mins × 60 secs × 1000ms
  })

  return token
}

export default generateToken