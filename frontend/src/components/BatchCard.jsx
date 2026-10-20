import { Link } from "react-router-dom"
import { Package, MapPin, Calendar, ArrowRight, Sprout } from "lucide-react"
import StepTimeline from "./StepTimeline"

const STAGE_STYLES = {
  farmer:    { bg: "#dcfce7", color: "#15803d" },
  processor: { bg: "#dbeafe", color: "#1d4ed8" },
  warehouse: { bg: "#fef3c7", color: "#d97706" },
  retailer:  { bg: "#f3e8ff", color: "#7c3aed" },
  completed: { bg: "#f1f5f9", color: "#475569" },
}

const BatchCard = ({ batch }) => {
  const style = STAGE_STYLES[batch.currentStage] || STAGE_STYLES.farmer

  return (
    <div className="card fade-in" style={{ transition: "all 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 48, height: 48,
            background: "#f0fdf4",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Sprout size={24} color="#16a34a" />
          </div>
          <div>
            <h3 style={{
              fontWeight: 900, fontSize: "1.1rem",
              color: "#14532d", fontFamily: "Nunito, sans-serif"
            }}>
              {batch.farmer?.cropName || "Unknown Crop"}
            </h3>
            <p style={{ color: "#86efac", fontSize: "0.8rem", fontWeight: 600 }}>
              {batch.batchId}
            </p>
          </div>
        </div>

        {/* Stage badge */}
        <span style={{
          padding: "4px 12px",
          borderRadius: 9999,
          fontSize: "0.72rem",
          fontWeight: 700,
          background: style.bg,
          color: style.color,
          textTransform: "capitalize",
          fontFamily: "Nunito, sans-serif"
        }}>
          {batch.currentStage}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={14} color="#86efac" />
          <span style={{ fontSize: "0.82rem", color: "#4d7c0f", fontWeight: 600, fontFamily: "Nunito, sans-serif" }}>
            {batch.farmer?.location || "N/A"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} color="#86efac" />
          <span style={{ fontSize: "0.82rem", color: "#4d7c0f", fontWeight: 600, fontFamily: "Nunito, sans-serif" }}>
            {batch.farmer?.harvestDate
              ? new Date(batch.farmer.harvestDate).toLocaleDateString("en-IN")
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div style={{
        padding: "10px 14px",
        background: "#f0fdf4",
        borderRadius: 10,
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 8
      }}>
        <Package size={14} color="#16a34a" />
        <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>
          {batch.farmer?.quantity} {batch.farmer?.quantityUnit}
        </span>
      </div>

      {/* Timeline */}
      <StepTimeline currentStage={batch.currentStage} />

      {/* View button */}
      <Link
        to={`/batch/${batch.batchId}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginTop: 14,
          padding: "10px",
          background: "#f0fdf4",
          borderRadius: 10,
          textDecoration: "none",
          color: "#15803d",
          fontWeight: 700,
          fontSize: "0.9rem",
          fontFamily: "Nunito, sans-serif",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
        onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}
      >
        View Full Journey <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export default BatchCard