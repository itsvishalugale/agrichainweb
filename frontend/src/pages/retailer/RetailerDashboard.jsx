import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { getBatchById, updateRetailer, markAsSold } from "../../services/api"
import Navbar from "../../components/Navbar"
import StepTimeline from "../../components/StepTimeline"
import toast from "react-hot-toast"
import {
  Search, Store, IndianRupee,
  Calendar, CheckCircle, AlertCircle,
  ClipboardList, MapPin, ShoppingBag,
  Package
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

const RetailerDashboard = () => {
  const { user }                    = useAuth()
  const [batchId,    setBatchId]    = useState("")
  const [batch,      setBatch]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searched,   setSearched]   = useState(false)
  const [markingSOld, setMarkingSold] = useState(false)

  const [formData, setFormData] = useState({
    storeName:    "",
    receivedDate: "",
    retailPrice:  "",
    shelfLocation:"",
    expiryDate:   "",
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
    if (!formData.storeName   || !formData.receivedDate ||
        !formData.retailPrice || !formData.expiryDate) {
      toast.error("Please fill all required fields")
      return
    }
    if (Number(formData.retailPrice) <= 0) {
      toast.error("Retail price must be greater than 0")
      return
    }
    if (new Date(formData.expiryDate) <= new Date()) {
      toast.error("Expiry date must be in the future")
      return
    }
    try {
      setSubmitting(true)
      await updateRetailer(batch.batchId, {
        ...formData,
        retailPrice: Number(formData.retailPrice)
      })
      toast.success("Retailer stage updated! 🏪")
      // Refresh batch to show updated state
      const res = await getBatchById(batch.batchId)
      setBatch(res.data.data.batch)
      setFormData({
        storeName: "", receivedDate: "",
        retailPrice: "", shelfLocation: "", expiryDate: ""
      })
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed!")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkAsSold = async () => {
    try {
      setMarkingSold(true)
      await markAsSold(batch.batchId)
      toast.success("Batch marked as sold! 🎉")
      // Refresh batch
      const res = await getBatchById(batch.batchId)
      setBatch(res.data.data.batch)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark as sold!")
    } finally {
      setMarkingSold(false)
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

  // Batch states for retailer
  const canReceive  = batch && batch.currentStage === "warehouse"
  const canMarkSold = batch && batch.currentStage === "retailer" &&
                      !batch.retailer?.isSold
  const alreadySold = batch && batch.currentStage === "completed"

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
            Retailer Dashboard 🏪
          </h1>
          <p style={{
            color: "#4d7c0f",
            fontFamily: "Nunito, sans-serif"
          }}>
            Welcome {user?.name}! Search a batch to receive or mark as sold.
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
            💡 Batch must be at warehouse stage before retailer can receive it
          </p>
        </div>

        {/* Results */}
        {searched && !loading && (

          batch === null ? (
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <AlertCircle size={48} color="#ef4444"
                style={{ margin: "0 auto 12px", display: "block" }} />
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

          ) : alreadySold ? (
            // Already sold state
            <div className="card fade-in" style={{ textAlign: "center", padding: "2.5rem" }}>
              <div style={{
                width: 72, height: 72, background: "#dcfce7",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <CheckCircle size={36} color="#16a34a" />
              </div>
              <h3 style={{
                fontWeight: 900, color: "#14532d",
                fontFamily: "Nunito, sans-serif", marginBottom: 8
              }}>
                Batch Already Sold! 🎉
              </h3>
              <p style={{
                color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
                marginBottom: 20
              }}>
                This batch has completed its journey successfully
              </p>

              {/* Final summary */}
              <div style={{
                background: "#f0fdf4", borderRadius: 14,
                padding: 20, textAlign: "left"
              }}>
                {[
                  { label: "🌾 Crop",     value: batch.farmer?.cropName },
                  { label: "🏪 Store",    value: batch.retailer?.storeName },
                  { label: "💰 Price",    value: `₹${batch.retailer?.retailPrice}/kg` },
                  { label: "📅 Expiry",   value: batch.retailer?.expiryDate
                      ? new Date(batch.retailer.expiryDate).toLocaleDateString("en-IN")
                      : "N/A"
                  },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #dcfce7"
                  }}>
                    <span style={{
                      fontSize: "0.85rem", color: "#4d7c0f",
                      fontFamily: "Nunito, sans-serif", fontWeight: 600
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: "0.85rem", color: "#14532d",
                      fontFamily: "Nunito, sans-serif", fontWeight: 800
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <StepTimeline currentStage="completed" />
            </div>

          ) : !canReceive && !canMarkSold ? (
            // Wrong stage
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
                Cannot Receive This Batch Yet
              </h3>
              <p style={{
                color: "#4d7c0f", fontFamily: "Nunito, sans-serif",
                marginBottom: 20
              }}>
                This batch is at{" "}
                <strong style={{ color: "#d97706" }}>
                  {batch.currentStage}
                </strong>{" "}
                stage. Retailer can only receive after warehouse stage.
              </p>
              <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                <StepTimeline currentStage={batch.currentStage} />
              </div>
            </div>

          ) : (
            <div className="fade-in">

              {/* Batch info card */}
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
                        {canMarkSold
                          ? "Batch On Your Shelf"
                          : "Batch Ready for Receiving"
                        }
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
                    background: canMarkSold ? "#f3e8ff" : "#fef3c7",
                    color: canMarkSold ? "#7c3aed" : "#d97706",
                    borderRadius: 9999, fontSize: "0.78rem",
                    fontWeight: 700, fontFamily: "Nunito, sans-serif"
                  }}>
                    {canMarkSold ? "ON SHELF 🏪" : "FROM WAREHOUSE ✅"}
                  </span>
                </div>

                {/* Supply chain summary */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 10, marginBottom: 16
                }}>
                  {[
                    { label: "🌾 Crop",      value: batch.farmer?.cropName },
                    { label: "📦 Quantity",  value: `${batch.farmer?.quantity} ${batch.farmer?.quantityUnit}` },
                    { label: "⭐ Grade",      value: `Grade ${batch.processor?.qualityGrade || "N/A"}` },
                    { label: "❄️ Storage",    value: batch.warehouse?.storageType || "N/A" },
                    { label: "🌡️ Temp",      value: batch.warehouse?.temperature || "N/A" },
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
                        fontSize: "0.85rem", color: "#14532d",
                        fontFamily: "Nunito, sans-serif", fontWeight: 800
                      }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <StepTimeline currentStage={batch.currentStage} />
              </div>

              {/* Mark as sold card — show if already received */}
              {canMarkSold && (
                <div className="card fade-in" style={{
                  marginBottom: 20,
                  border: "2px solid #f3e8ff",
                  background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)"
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 16
                  }}>
                    <div>
                      <h3 style={{
                        fontWeight: 900, color: "#14532d",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "1.1rem", marginBottom: 4
                      }}>
                        Ready to Mark as Sold?
                      </h3>
                      <p style={{
                        color: "#4d7c0f", fontSize: "0.85rem",
                        fontFamily: "Nunito, sans-serif"
                      }}>
                        Store: {batch.retailer?.storeName} •
                        Price: ₹{batch.retailer?.retailPrice}/kg •
                        Shelf: {batch.retailer?.shelfLocation || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={handleMarkAsSold}
                      disabled={markingSOld}
                      style={{
                        padding: "12px 24px",
                        background: markingSOld ? "#c4b5fd" : "#7c3aed",
                        color: "white", border: "none",
                        borderRadius: 12, cursor: "pointer",
                        fontWeight: 800, fontSize: "0.95rem",
                        fontFamily: "Nunito, sans-serif",
                        display: "flex", alignItems: "center", gap: 8,
                        transition: "all 0.2s"
                      }}
                    >
                      {markingSOld ? (
                        <>
                          <div style={{
                            width: 16, height: 16,
                            border: "2px solid rgba(255,255,255,0.4)",
                            borderTopColor: "white", borderRadius: "50%",
                            animation: "spin 1s linear infinite"
                          }} />
                          Marking...
                        </>
                      ) : (
                        <><ShoppingBag size={18} /> Mark as Sold</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Receive form — show if from warehouse */}
              {canReceive && (
                <div className="card">
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 24, padding: "12px 16px",
                    background: "#f3e8ff", borderRadius: 12
                  }}>
                    <ClipboardList size={20} color="#7c3aed" />
                    <span style={{
                      fontWeight: 800, color: "#7c3aed",
                      fontFamily: "Nunito, sans-serif"
                    }}>
                      Receiving Details
                    </span>
                  </div>

                  <FormField label="Store Name" required>
                    <div style={{ position: "relative" }}>
                      <Store size={16} color="#86efac" style={{
                        position: "absolute", left: 12,
                        top: "50%", transform: "translateY(-50%)"
                      }} />
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        placeholder="Big Bazaar Mumbai"
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => e.target.style.borderColor = "#16a34a"}
                        onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                      />
                    </div>
                  </FormField>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FormField label="Received Date" required>
                      <div style={{ position: "relative" }}>
                        <Calendar size={16} color="#86efac" style={{
                          position: "absolute", left: 12,
                          top: "50%", transform: "translateY(-50%)"
                        }} />
                        <input
                          type="date"
                          name="receivedDate"
                          value={formData.receivedDate}
                          onChange={handleChange}
                          max={new Date().toISOString().split("T")[0]}
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => e.target.style.borderColor = "#16a34a"}
                          onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                        />
                      </div>
                    </FormField>

                    <FormField label="Expiry Date" required>
                      <div style={{ position: "relative" }}>
                        <Calendar size={16} color="#86efac" style={{
                          position: "absolute", left: 12,
                          top: "50%", transform: "translateY(-50%)"
                        }} />
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => e.target.style.borderColor = "#16a34a"}
                          onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                        />
                      </div>
                    </FormField>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <FormField
                      label="Retail Price (₹/kg)"
                      required
                      hint="Price per kg in rupees"
                    >
                      <div style={{ position: "relative" }}>
                        <IndianRupee size={16} color="#86efac" style={{
                          position: "absolute", left: 12,
                          top: "50%", transform: "translateY(-50%)"
                        }} />
                        <input
                          type="number"
                          name="retailPrice"
                          value={formData.retailPrice}
                          onChange={handleChange}
                          placeholder="120"
                          min="1"
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => e.target.style.borderColor = "#16a34a"}
                          onBlur={e  => e.target.style.borderColor = "#bbf7d0"}
                        />
                      </div>
                    </FormField>

                    <FormField
                      label="Shelf Location"
                      hint="e.g. Aisle 3, Rack B"
                    >
                      <div style={{ position: "relative" }}>
                        <MapPin size={16} color="#86efac" style={{
                          position: "absolute", left: 12,
                          top: "50%", transform: "translateY(-50%)"
                        }} />
                        <input
                          type="text"
                          name="shelfLocation"
                          value={formData.shelfLocation}
                          onChange={handleChange}
                          placeholder="Aisle 3, Rack B"
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
                      <><Package size={18} /> Confirm Receipt</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default RetailerDashboard