class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message)
    // super() calls the parent Error class
    // so this behaves like a real JS Error object

    this.statusCode = statusCode
    this.message = message
    this.success = false
    this.errors = errors
    // errors = array of detailed errors
    // useful for validation errors like
    // ["email is required", "password too short"]
  }
}

export default ApiError