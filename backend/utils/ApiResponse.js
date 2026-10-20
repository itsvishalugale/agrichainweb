class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
    // if statusCode is less than 400 → success is true
    // 200, 201 → success: true
    // 400, 401, 500 → success: false
  }
}

export default ApiResponse