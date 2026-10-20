import { CheckCircle, Circle } from "lucide-react"

const STAGES = [
  { key: "farmer",    label: "Farmer",    emoji: "🌾" },
  { key: "processor", label: "Processor", emoji: "🏭" },
  { key: "warehouse", label: "Warehouse", emoji: "🏢" },
  { key: "retailer",  label: "Retailer",  emoji: "🏪" },
  { key: "completed", label: "Sold",      emoji: "✅" },
]

const StepTimeline = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage)

  return (
    <div style={{ width: "100%", padding: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>

        {/* Background line */}
        <div style={{
          position: "absolute", top: 20,
          left: "5%", right: "5%",
          height: 3, background: "#dcfce7", zIndex: 0
        }} />

        {/* Filled line */}
        <div style={{
          position: "absolute", top: 20,
          left: "5%",
          height: 3,
          background: "#16a34a",
          zIndex: 1,
          width: `${(currentIndex / (STAGES.length - 1)) * 90}%`,
          transition: "width 0.6s ease"
        }} />

        {STAGES.map((stage, index) => {
          const isDone    = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          return (
            <div key={stage.key} style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6, zIndex: 2,
              flex: 1
            }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem",
                border: `2px solid ${isDone || isCurrent ? "#16a34a" : "#bbf7d0"}`,
                background: isDone ? "#16a34a" : "white",
                boxShadow: isCurrent ? "0 0 0 4px rgba(22,163,74,0.15)" : "none",
                transition: "all 0.3s"
              }}>
                {isDone
                  ? <CheckCircle size={20} color="white" />
                  : isCurrent
                    ? <span>{stage.emoji}</span>
                    : <Circle size={20} color="#bbf7d0" />
                }
              </div>
              <span style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: isDone || isCurrent ? "#15803d" : "#86efac",
                fontFamily: "Nunito, sans-serif",
                textAlign: "center"
              }}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepTimeline