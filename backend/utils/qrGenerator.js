import QRCode from "qrcode"

const generateQRCode = async (batchId) => {
  try {
    // converts batchId text into base64 image string
    // base64 = image stored as text
    // we store this string in MongoDB directly
    // no need for cloudinary just for QR ✅
    const qrCodeBase64 = await QRCode.toDataURL(batchId, {
      errorCorrectionLevel: "H",
      // H = highest error correction
      // even if QR is slightly damaged it still scans ✅
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
    return qrCodeBase64
    // returns something like:
    // "data:image/png;base64,iVBORw0KGgoAAAANS..."
    // frontend directly shows this as <img src={qrCode} />
  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`)
  }
}

export default generateQRCode