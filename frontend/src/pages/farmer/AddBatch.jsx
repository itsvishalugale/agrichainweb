import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { createBatch } from "../../services/api"
import Navbar from "../../components/Navbar"
import toast from "react-hot-toast"
import {
  ArrowLeft, Sprout, MapPin, Calendar,
  Package, FlaskConical, ArrowRight,
  CheckCircle
} from "lucide-react"

// Step indicator component
// Shows which step user is on
const StepIndicator = ({ currentStep, steps }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 0,
    marginBottom: 36
  }}>
    {steps.map((step, index) => (
      <div key={index} style={{ display: "flex", alignItems: "center" }}>

        {/* Circle */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 6
        }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "1rem",
            fontFamily: "Nunito, sans-serif",
            transition: "all 0.3s",
            background: index < currentStep
              ? "#16a34a"
              : index === currentStep
                ? "#14532d"
                : "#dcfce7",
            color: index <= currentStep ? "white" : "#86efac",
            boxShadow: index === currentStep
              ? "0 0 0 4px rgba(22,163,74,0.2)"
              : "none"
          }}>
            {index < currentStep
              ? <CheckCircle size={20} />
              : step.icon
            }
          </div>
          <span style={{
            fontSize: "0.72rem", fontWeight: 700,
            color: index <= currentStep ? "#14532d" : "#86efac",
            fontFamily: "Nunito, sans-serif",
            whiteSpace: "nowrap"
          }}>
            {step.label}
          </span>
        </div>

        {/* Line between steps */}
        {index < steps.length - 1 && (
          <div style={{
            width: 60, height: 3,
            marginBottom: 22,
            background: index < currentStep ? "#16a34a" : "#dcfce7",
            transition: "background 0.3s"
          }} />
        )}
      </div>
    ))}
  </div>
)

// Reusable form field component
const FormField = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{
      display: "block",
      fontSize: "0.85rem",
      fontWeight: 700,
      color: "#14532d",
      marginBottom: 8,
      fontFamily: "Nunito, sans-serif"
    }}>
      {label}
      {required && (
        <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>
      )}
    </label>
    {children}
    {hint && (
      <p style={{
        fontSize: "0.75rem", color: "#4d7c0f",
        marginTop: 6, fontFamily: "Nunito, sans-serif"
      }}>
        💡 {hint}
      </p>
    )}
  </div>
)

const STEPS = [
  { label: "Crop Info",   icon: "🌾" },
  { label: "Location",    icon: "📍" },
  { label: "Harvest",     icon: "📅" },
  { label: "Review",      icon: "✅" },
]

const AddBatch = () => {
  const { user }      = useAuth()
  const navigate       = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // All form data in one state object
  const [formData, setFormData] = useState({
    cropName:      "",
    quantity:      "",
    quantityUnit:  "kg",
    pesticideUsed: "None",
    location:      "",
    village:       "",
    harvestDate:   "",
  })

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  // Validate each step before moving forward
  const validateStep = () => {
    if (step === 0) {
      if (!formData.cropName || !formData.quantity) {
        toast.error("Please fill crop name and quantity")
        return false
      }
      if (formData.quantity <= 0) {
        toast.error("Quantity must be greater than 0")
        return false
      }
    }
    if (step === 1) {
      if (!formData.location) {
        toast.error("Please enter location")
        return false
      }
    }
    if (step === 2) {
      if (!formData.harvestDate) {
        toast.error("Please select harvest date")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) setStep(step + 1)
  }

  const handleBack = () => setStep(step - 1)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await createBatch({
        ...formData,
        quantity: Number(formData.quantity),
        // convert string to number before sending
      })
      toast.success("Batch created successfully! 🌾")
      navigate("/farmer/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create batch")
    } finally {
      setLoading(false)
    }
  }

  // Input style reused across fields
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #bbf7d0",
    borderRadius: 12,
    background: "white",
    color: "#14532d",
    fontFamily: "Nunito, sans-serif",
    fontWeight: 600,
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  }

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none",
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content" style={{ maxWidth: 640 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <Link
            to="/farmer/dashboard"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "#4d7c0f", textDecoration: "none",
              fontWeight: 700, fontFamily: "Nunito, sans-serif",
              fontSize: "0.9rem", marginBottom: 16
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 6
          }}>
            Add New Batch 🌱
          </h1>
          <p style={{
            color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
          }}>
            Fill in your crop details step by step
          </p>
        </div>

        {/* Card */}
        <div className="card fade-in">

          {/* Step indicator */}
          <StepIndicator currentStep={step} steps={STEPS} />

          {/* ─── STEP 0 — Crop Info ─── */}
          {step === 0 && (
            <div className="fade-in">
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 24, padding: "12px 16px",
                background: "#f0fdf4", borderRadius: 12
              }}>
                <Sprout size={20} color="#16a34a" />
                <span style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif"
                }}>
                  Crop Information
                </span>
              </div>

              <FormField label="Crop Name" required hint="e.g. Mango, Rice, Wheat, Tomato">
                <input
                  type="text"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="Enter crop name"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <FormField label="Quantity" required>
                  <div style={{ position: "relative" }}>
                    <Package size={16} color="#86efac" style={{
                      position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)"
                    }} />
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="500"
                      min="1"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => e.target.style.borderColor = "#16a34a"}
                      onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                    />
                  </div>
                </FormField>

                <FormField label="Unit">
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                  </select>
                </FormField>
              </div>

              <FormField
                label="Pesticide Used"
                hint="Write 'None' if no pesticide was used"
              >
                <div style={{ position: "relative" }}>
                  <FlaskConical size={16} color="#86efac" style={{
                    position: "absolute", left: 12,
                    top: "50%", transform: "translateY(-50%)"
                  }} />
                  <input
                    type="text"
                    name="pesticideUsed"
                    value={formData.pesticideUsed}
                    onChange={handleChange}
                    placeholder="None"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                  />
                </div>
              </FormField>
            </div>
          )}

          {/* ─── STEP 1 — Location ─── */}
          {step === 1 && (
            <div className="fade-in">
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 24, padding: "12px 16px",
                background: "#f0fdf4", borderRadius: 12
              }}>
                <MapPin size={20} color="#16a34a" />
                <span style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif"
                }}>
                  Farm Location
                </span>
              </div>

              <FormField
                label="District / City"
                required
                hint="e.g. Ratnagiri, Maharashtra"
              >
                <div style={{ position: "relative" }}>
                  <MapPin size={16} color="#86efac" style={{
                    position: "absolute", left: 12,
                    top: "50%", transform: "translateY(-50%)"
                  }} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ratnagiri, Maharashtra"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                  />
                </div>
              </FormField>

              <FormField
                label="Village Name"
                hint="Optional — helps consumers know exact origin"
              >
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Devgad"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                />
              </FormField>

              {/* Info box */}
              <div style={{
                padding: "14px 16px",
                background: "#dcfce7",
                borderRadius: 12,
                border: "1px solid #bbf7d0"
              }}>
                <p style={{
                  fontSize: "0.82rem", color: "#15803d",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600
                }}>
                  📍 This location will be shown to consumers when they
                  scan the QR code. Be as specific as possible for
                  better trust! ✅
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 2 — Harvest Date ─── */}
          {step === 2 && (
            <div className="fade-in">
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 24, padding: "12px 16px",
                background: "#f0fdf4", borderRadius: 12
              }}>
                <Calendar size={20} color="#16a34a" />
                <span style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif"
                }}>
                  Harvest Details
                </span>
              </div>

              <FormField
                label="Harvest Date"
                required
                hint="When was this crop harvested?"
              >
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  // max = today, can't select future date
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                />
              </FormField>

              {/* Summary preview */}
              <div style={{
                padding: 16,
                background: "#f0fdf4",
                borderRadius: 12,
                border: "1px solid #dcfce7"
              }}>
                <p style={{
                  fontWeight: 800, color: "#14532d",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 12, fontSize: "0.9rem"
                }}>
                  📋 Batch Preview
                </p>
                {[
                  { label: "Crop",     value: formData.cropName },
                  { label: "Quantity", value: `${formData.quantity} ${formData.quantityUnit}` },
                  { label: "Location", value: formData.location },
                  { label: "Village",  value: formData.village || "Not specified" },
                  { label: "Pesticide",value: formData.pesticideUsed },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    marginBottom: 8
                  }}>
                    <span style={{
                      fontSize: "0.82rem", color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif", fontWeight: 600
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: "0.82rem", color: "#14532d",
                      fontFamily: "Nunito, sans-serif", fontWeight: 700
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 3 — Review & Submit ─── */}
          {step === 3 && (
            <div className="fade-in">
              <div style={{
                textAlign: "center",
                padding: "20px 0 28px"
              }}>
                <div style={{
                  width: 72, height: 72,
                  background: "#dcfce7",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}>
                  <CheckCircle size={36} color="#16a34a" />
                </div>
                <h3 style={{
                  fontSize: "1.4rem", fontWeight: 900,
                  color: "#14532d", fontFamily: "Nunito, sans-serif",
                  marginBottom: 8
                }}>
                  Everything looks good!
                </h3>
                <p style={{
                  color: "#4d7c0f", fontFamily: "Nunito, sans-serif"
                }}>
                  Review your batch details before submitting
                </p>
              </div>

              {/* Full review */}
              <div style={{
                background: "#f0fdf4",
                borderRadius: 14,
                padding: 20,
                marginBottom: 24
              }}>
                {[
                  { label: "👤 Farmer",    value: user?.name },
                  { label: "🌾 Crop",      value: formData.cropName },
                  { label: "📦 Quantity",  value: `${formData.quantity} ${formData.quantityUnit}` },
                  { label: "📍 Location",  value: formData.location },
                  { label: "🏘️ Village",   value: formData.village || "Not specified" },
                  { label: "📅 Harvested", value: formData.harvestDate
                      ? new Date(formData.harvestDate).toLocaleDateString("en-IN")
                      : "N/A"
                  },
                  { label: "🧪 Pesticide", value: formData.pesticideUsed },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #dcfce7"
                  }}>
                    <span style={{
                      fontSize: "0.85rem", color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif", fontWeight: 600
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: "0.9rem", color: "#14532d",
                      fontFamily: "Nunito, sans-serif", fontWeight: 800
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* What happens next info */}
              <div style={{
                padding: 16,
                background: "#dbeafe",
                borderRadius: 12,
                border: "1px solid #bfdbfe",
                marginBottom: 8
              }}>
                <p style={{
                  fontSize: "0.82rem", color: "#1d4ed8",
                  fontFamily: "Nunito, sans-serif", fontWeight: 600
                }}>
                  ℹ️ After submitting:
                  A unique Batch ID and QR Code will be generated.
                  Share the QR code with your processor to continue
                  the supply chain journey!
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            paddingTop: 20,
            borderTop: "2px solid #f0fdf4"
          }}>
            {/* Back button */}
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="btn-secondary"
                style={{ fontSize: "0.95rem" }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div /> // empty div to keep flex spacing
            )}

            {/* Next / Submit button */}
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ fontSize: "0.95rem" }}
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary"
                style={{ fontSize: "0.95rem", minWidth: 160 }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Create Batch
                  </>
                )}
              </button>
            )}
          </div>

          {/* Step counter */}
          <p style={{
            textAlign: "center", marginTop: 16,
            fontSize: "0.8rem", color: "#86efac",
            fontFamily: "Nunito, sans-serif", fontWeight: 600
          }}>
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

export default AddBatch