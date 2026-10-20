import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getBatchById, updateProcessor } from "../../services/api"
import Navbar from "../../components/Navbar"
import StepTimeline from "../../components/StepTimeline"
import toast from "react-hot-toast"
import {
  Search, Factory, Package,
  CheckCircle, AlertCircle, ClipboardList
} from "lucide-react"

// Reusable form field
const FormField = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{
      display: "block", fontSize: "0.85rem",
      fontWeight: 700, color: "#14532d",
      marginBottom: 8, fontFamily: "Nunito, sans-serif"
    }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
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

const ProcessorDashboard = () => {
  const { user }               = useAuth()
  const [batchId,  setBatchId] = useState("")
  const [batch,    setBatch]   = useState(null)
  const [loading,  setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searched, setSearched] = useState(false)

  const [formData, setFormData] = useState({
    facilityName:    "",
    processingDate:  "",
    packagingType:   "",
    qualityGrade:    "",
    additionalNotes: "",
  })

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  // Search batch by ID
  const handleSearch = async () => {
    if (!batchId.trim()) {
      toast.error("Please enter a Batch ID")
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      const res = await getBatchById(batchId.trim().toUpperCase())
      setBatch(res.data.data.batch)
    } catch (error) {
      setBatch(null)
      toast.error("Batch not found!")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.facilityName || !formData.processingDate ||
        !formData.packagingType || !formData.qualityGrade) {
      toast.error("Please fill all required fields")
      return
    }
    try {
      setSubmitting(true)
      await updateProcessor(batch.batchId, formData)
      toast.success("Processing stage updated! 🏭")
      // Reset everything
      setBatch(null)
      setBatchId("")
      setSearched(false)
      setFormData({
        facilityName: "", processingDate: "",
        packagingType: "", qualityGrade: "", additionalNotes: ""
      })
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!")
    } finally {
      setSubmitting(false)
    }
  }

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

  // Check if batch is ready for processor
  const canProcess = batch && batch.currentStage === "farmer"

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="page-content" style={{ maxWidth: 720 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }} className="fade-in">
          <h1 style={{
            fontSize: "1.9rem", fontWeight: 900,
            color: "#14532d", fontFamily: "Nunito, sans-serif",
            marginBottom: 6
          }}>
            Processor Dashboard 🏭
          </h1>
          <p style={{
            color: "#4d7c0f",
            fontFamily: "Nunito, sans-serif"
          }}>
            Welcome {user?.name}! Search a batch ID to process it.
          </p>
        </div>

        {/* Search box */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <p style={{
            fontWeight: 800, color: "#14532d",
            fontFamily: "Nunito, sans-serif",
            marginBottom: 14, fontSize: "1rem"
          }}>
            🔍 Search Batch
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="#86efac" style={{
                position: "absolute", left: 12,
                top: "50%", transform: "translateY(-50%)"
              }} />
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. BATCH-2026-0001"
                style={{ ...inputStyle, paddingLeft: 40 }}
                onFocus={e => e.target.style.borderColor = "#16a34a"}
                onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {loading ? (
                <div style={{
                  width: 18, height: 18,
                  border: "2px solid rgba(255,255,255,0.4)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
              ) : (
                <><Search size={16} /> Search</>
              )}
            </button>
          </div>

          <p style={{
            fontSize: "0.78rem", color: "#4d7c0f",
            marginTop: 10, fontFamily: "Nunito, sans-serif"
          }}>
            💡 Ask the farmer for their Batch ID or scan the QR code
          </p>
        </div>

        {/* Search result */}
        {searched && !loading && (

          batch === null ? (
            // Not found
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 12px" }} />
              <h3 style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif", marginBottom: 8
              }}>
                Batch Not Found
              </h3>
              <p style={{ color: "#4d7c0f", fontFamily: "Nunito, sans-serif" }}>
                No batch found with ID "{batchId}". Please check and try again.
              </p>
            </div>

          ) : !canProcess ? (
            // Wrong stage
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <div style={{
                width: 64, height: 64,
                background: "#fef3c7",
                borderRadius: "50%",
                display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 16px"
              }}>
                <AlertCircle size={32} color="#d97706" />
              </div>
              <h3 style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif", marginBottom: 8
              }}>
                Cannot Process This Batch
              </h3>
              <p style={{
                color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
                marginBottom: 20
              }}>
                This batch is currently at{" "}
                <strong style={{ color: "#d97706" }}>
                  {batch.currentStage}
                </strong>{" "}
                stage. Processor can only update after farmer stage.
              </p>

              {/* Show timeline anyway */}
              <div style={{
                background: "#f0fdf4", borderRadius: 12, padding: 16
              }}>
                <p style={{
                  fontWeight: 700, color: "#14532d",
                  fontFamily: "Nunito, sans-serif",
                  marginBottom: 8, fontSize: "0.85rem"
                }}>
                  Current Journey
                </p>
                <StepTimeline currentStage={batch.currentStage} />
              </div>
            </div>

          ) : (
            // Ready to process
            <div className="fade-in">

              {/* Batch info card */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 16
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <CheckCircle size={18} color="#16a34a" />
                      <span style={{
                        fontWeight: 800, color: "#16a34a",
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        Batch Ready for Processing
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: "1.3rem", fontWeight: 900,
                      color: "#14532d", fontFamily: "Nunito, sans-serif"
                    }}>
                      {batch.farmer?.cropName}
                    </h3>
                    <p style={{
                      color: "#86efac", fontSize: "0.85rem",
                      fontFamily: "Nunito, sans-serif", fontWeight: 600
                    }}>
                      {batch.batchId}
                    </p>
                  </div>

                  <span style={{
                    padding: "6px 14px",
                    background: "#dcfce7",
                    color: "#15803d",
                    borderRadius: 9999,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    FROM FARMER ✅
                  </span>
                </div>

                {/* Farmer details */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12, marginBottom: 16
                }}>
                  {[
                    { label: "Farmer",    value: batch.farmer?.farmerName },
                    { label: "Quantity",  value: `${batch.farmer?.quantity} ${batch.farmer?.quantityUnit}` },
                    { label: "Location",  value: batch.farmer?.location },
                    { label: "Harvested", value: batch.farmer?.harvestDate
                        ? new Date(batch.farmer.harvestDate).toLocaleDateString("en-IN")
                        : "N/A"
                    },
                    { label: "Pesticide", value: batch.farmer?.pesticideUsed },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: "10px 14px",
                      background: "#f0fdf4",
                      borderRadius: 10
                    }}>
                      <p style={{
                        fontSize: "0.72rem", color: "#4d7c0f",
                        fontFamily: "Nunito, sans-serif", fontWeight: 600
                      }}>
                        {label}
                      </p>
                      <p style={{
                        fontSize: "0.88rem", color: "#14532d",
                        fontFamily: "Nunito, sans-serif", fontWeight: 800
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <StepTimeline currentStage={batch.currentStage} />
              </div>

              {/* Processing form */}
              <div className="card">
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 24, padding: "12px 16px",
                  background: "#dbeafe", borderRadius: 12
                }}>
                  <ClipboardList size={20} color="#1d4ed8" />
                  <span style={{
                    fontWeight: 800, color: "#1d4ed8",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    Processing Details
                  </span>
                </div>

                <FormField label="Facility Name" required hint="Name of your processing facility">
                  <div style={{ position: "relative" }}>
                    <Factory size={16} color="#86efac" style={{
                      position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)"
                    }} />
                    <input
                      type="text"
                      name="facilityName"
                      value={formData.facilityName}
                      onChange={handleChange}
                      placeholder="ABC Foods Pvt Ltd"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => e.target.style.borderColor = "#16a34a"}
                      onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                    />
                  </div>
                </FormField>

                <FormField label="Processing Date" required>
                  <input
                    type="date"
                    name="processingDate"
                    value={formData.processingDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                  />
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Packaging Type" required>
                    <select
                      name="packagingType"
                      value={formData.packagingType}
                      onChange={handleChange}
                      style={{
                        ...inputStyle, cursor: "pointer",
                        appearance: "none"
                      }}
                    >
                      <option value="">Select type</option>
                      <option value="box">📦 Box</option>
                      <option value="bag">🛍️ Bag</option>
                      <option value="crate">🗃️ Crate</option>
                      <option value="loose">🌿 Loose</option>
                    </select>
                  </FormField>

                  <FormField label="Quality Grade" required hint="A=Best B=Average C=Below avg">
                    <select
                      name="qualityGrade"
                      value={formData.qualityGrade}
                      onChange={handleChange}
                      style={{
                        ...inputStyle, cursor: "pointer",
                        appearance: "none"
                      }}
                    >
                      <option value="">Select grade</option>
                      <option value="A">⭐ Grade A — Premium</option>
                      <option value="B">👍 Grade B — Standard</option>
                      <option value="C">✔️ Grade C — Economy</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Additional Notes" hint="Any special processing details">
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    placeholder="e.g. Washed and sorted before packaging..."
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: 80
                    }}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                  />
                </FormField>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: "100%", fontSize: "1rem", padding: "14px" }}
                >
                  {submitting ? (
                    <>
                      <div style={{
                        width: 18, height: 18,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Package size={18} />
                      Submit Processing Details
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default ProcessorDashboard