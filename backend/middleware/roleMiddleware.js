import ApiError from "../utils/ApiError.js"

// This middleware runs AFTER protect middleware
// By this point req.user is already set

const allowRoles = (...roles) => {
  return (req, res, next) => {
    // check if logged in user's role is in allowed roles list
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Only ${roles.join(", ")} can do this`
      )
    }
    next()
  }
}

export default allowRoles

// 4. Why this pattern is used

// This is called:

// 👉 Middleware Factory Function

// Think of it like a machine that creates middleware based on input.