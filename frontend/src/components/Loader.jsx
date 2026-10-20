import { Leaf } from "lucide-react"

const Loader = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4"
  }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 16px" }}>
        <div style={{
          width: 80, height: 80,
          border: "4px solid #bbf7d0",
          borderTopColor: "#16a34a",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Leaf size={28} color="#16a34a" />
        </div>
      </div>
      <p style={{
        color: "#16a34a", fontWeight: 700,
        fontSize: "1.1rem", fontFamily: "Nunito, sans-serif"
      }}>
        Loading AgriChain...
      </p>
    </div>
  </div>
)

export default Loader