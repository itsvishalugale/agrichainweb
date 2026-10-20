import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getBatchById, updateWarehouse } from "../../services/api"
import Navbar from "../../components/Navbar"
import StepTimeline from "../../components/StepTimeline"
import toast from "react-hot-toast"
import {
  Search, Warehouse, Thermometer,
  Calendar, CheckCircle, AlertCircle,
  ClipboardList, MapPin
} from "lucide-react"

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

const WarehouseDashboard = () => {
  const { user }                    = useAuth()
  const [batchId,    setBatchId]    = useState("")
  const [batch,      setBatch]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searched,   setSearched]   = useState(false)

  const [formData, setFormData] = useState({
    warehouseName:    "",
    storageType:      "",
    entryDate:        "",
    expectedExitDate: "",
    storageLocation:  "",
    temperature:      "",
  })

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSearch = async () => {
    if (!batchId.trim()) {
      toast.error("Please enter a Batch ID")
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      setBatch(null)
      const res = await getBatchById(batchId.trim().toUpperCase())
      setBatch(res.data.data.batch)
    } catch {
      setBatch(null)
      toast.error("Batch not found!")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.warehouseName || !formData.storageType ||
        !formData.entryDate     || !formData.expectedExitDate) {
      toast.error("Please fill all required fields")
      return
    }

    // Check exit date is after entry date
    if (new Date(formData.expectedExitDate) <= new Date(formData.entryDate)) {
      toast.error("Exit date must be after entry date")
      return
    }

    try {
      setSubmitting(true)
      await updateWarehouse(batch.batchId, formData)
      toast.success("Warehouse stage updated! 🏢")
      setBatch(null)
      setBatchId("")
      setSearched(false)
      setFormData({
        warehouseName: "", storageType: "",
        entryDate: "", expectedExitDate: "",
        storageLocation: "", temperature: ""
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

  const canStore = batch && batch.currentStage === "processor"

  // Storage type config
  const STORAGE_TYPES = [
    { value: "cold",  label: "❄️ Cold Storage",  desc: "Below 10°C",  color: "#dbeafe" },
    { value: "dry",   label: "🌾 Dry Storage",   desc: "Room temp",   color: "#fef3c7" },
    { value: "humid", label: "💧 Humid Storage",  desc: "High humidity", color: "#dcfce7" },
  ]

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
            Warehouse Dashboard 🏢
          </h1>
          <p style={{
            color: "#4d7c0f",
            fontFamily: "Nunito, sans-serif"
          }}>
            Welcome {user?.name}! Search a batch to log storage details.
          </p>
        </div>

        {/* Search */}
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
                  borderTopColor: "white", borderRadius: "50%",
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
            💡 The batch must be at processor stage before warehouse can update it
          </p>
        </div>

        {/* Results */}
        {searched && !loading && (

          batch === null ? (
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 12px" }} />
              <h3 style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif", marginBottom: 8
              }}>
                Batch Not Found
              </h3>
              <p style={{ color: "#4d7c0f", fontFamily: "Nunito, sans-serif" }}>
                No batch found with ID "{batchId}"
              </p>
            </div>

          ) : !canStore ? (
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <div style={{
                width: 64, height: 64, background: "#fef3c7",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <AlertCircle size={32} color="#d97706" />
              </div>
              <h3 style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif", marginBottom: 8
              }}>
                Cannot Store This Batch Yet
              </h3>
              <p style={{
                color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
                marginBottom: 20
              }}>
                This batch is at{" "}
                <strong style={{ color: "#d97706" }}>
                  {batch.currentStage}
                </strong>{" "}
                stage. Warehouse can only update after processor stage.
              </p>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <StepTimeline currentStage={batch.currentStage} />
              </div>
            </div>

          ) : (
            <div className="fade-in">

              {/* Batch info */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 16
                }}>
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 4
                    }}>
                      <CheckCircle size={18} color="#16a34a" />
                      <span style={{
                        fontWeight: 800, color: "#16a34a",
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        Batch Ready for Storage
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
                    padding: "6px 14px", background: "#dbeafe",
                    color: "#1d4ed8", borderRadius: 9999,
                    fontSize: "0.78rem", fontWeight: 700,
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    FROM PROCESSOR ✅
                  </span>
                </div>

                {/* Details grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 12, marginBottom: 16
                }}>
                  {[
                    { label: "Crop",       value: batch.farmer?.cropName },
                    { label: "Quantity",   value: `${batch.farmer?.quantity} ${batch.farmer?.quantityUnit}` },
                    { label: "Facility",   value: batch.processor?.facilityName },
                    { label: "Quality",    value: `Grade ${batch.processor?.qualityGrade}` },
                    { label: "Packaging",  value: batch.processor?.packagingType },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: "10px 14px",
                      background: "#f0fdf4", borderRadius: 10
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
                        {value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>

                <StepTimeline currentStage={batch.currentStage} />
              </div>

              {/* Storage form */}
              <div className="card">
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 24, padding: "12px 16px",
                  background: "#fef3c7", borderRadius: 12
                }}>
                  <ClipboardList size={20} color="#d97706" />
                  <span style={{
                    fontWeight: 800, color: "#d97706",
                    fontFamily: "Nunito, sans-serif"
                  }}>
                    Storage Details
                  </span>
                </div>

                <FormField label="Warehouse Name" required>
                  <div style={{ position: "relative" }}>
                    <Warehouse size={16} color="#86efac" style={{
                      position: "absolute", left: 12,
                      top: "50%", transform: "translateY(-50%)"
                    }} />
                    <input
                      type="text"
                      name="warehouseName"
                      value={formData.warehouseName}
                      onChange={handleChange}
                      placeholder="Pune Cold Storage Ltd"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      onFocus={e => e.target.style.borderColor = "#16a34a"}
                      onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                    />
                  </div>
                </FormField>

                {/* Storage type — visual card selection */}
                <FormField label="Storage Type" required>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10
                  }}>
                    {STORAGE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, storageType: type.value })}
                        style={{
                          padding: "14px 10px",
                          borderRadius: 12,
                          border: `2px solid ${formData.storageType === type.value ? "#16a34a" : "#bbf7d0"}`,
                          background: formData.storageType === type.value
                            ? type.color : "white",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s",
                          transform: formData.storageType === type.value
                            ? "scale(1.04)" : "scale(1)"
                        }}
                      >
                        <p style={{
                          fontWeight: 800, color: "#14532d",
                          fontFamily: "Nunito, sans-serif",
                          fontSize: "0.85rem", marginBottom: 4
                        }}>
                          {type.label}
                        </p>
                        <p style={{
                          fontSize: "0.72rem", color: "#4d7c0f",
                          fontFamily: "Nunito, sans-serif"
                        }}>
                          {type.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Entry Date" required>
                    <div style={{ position: "relative" }}>
                      <Calendar size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="date"
                        name="entryDate"
                        value={formData.entryDate}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </FormField>

                  <FormField label="Expected Exit Date" required>
                    <div style={{ position: "relative" }}>
                      <Calendar size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="date"
                        name="expectedExitDate"
                        value={formData.expectedExitDate}
                        onChange={handleChange}
                        min={formData.entryDate || new Date().toISOString().split("T")[0]}
                        // min = entry date so exit can't be before entry ✅
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </FormField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField
                    label="Storage Location"
                    hint="Section / Rack number"
                  >
                    <div style={{ position: "relative" }}>
                      <MapPin size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="text"
                        name="storageLocation"
                        value={formData.storageLocation}
                        onChange={handleChange}
                        placeholder="Section A, Rack 3"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Temperature"
                    hint="e.g. 4°C or Room temp"
                  >
                    <div style={{ position: "relative" }}>
                      <Thermometer size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="text"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        placeholder="4°C"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </FormField>
                </div>

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
                        borderTopColor: "white", borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                      }} />
                      Updating...
                    </>
                  ) : (
                    <><Warehouse size={18} /> Submit Storage Details</>
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

export default WarehouseDashboard