export default function ProgressBar({ completed, total }) {
  const width = total ? (completed / total) * 100 : 0
  return (
    <div className="progress">
      <div style={{ width: "100%", background: "#ddd", height: "20px", borderRadius: "15px" }}>
        <div style={{
          width: `${width}%`,
          background: "#0077ff",
          height: "100%",
          borderRadius: "15px"
        }}></div>
      </div>
      {total > 0 && <span>{completed}/{total}</span>}
    </div>
  );
}
