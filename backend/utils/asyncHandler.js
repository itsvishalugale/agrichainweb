const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    // if error is our ApiError → use its statusCode
    // if unknown error → use 500
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
      statusCode,
      message: error.message || "Something went wrong",
      success: false,
      errors: error.errors || [],
    })
  }
}

export default asyncHandler