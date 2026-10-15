import Renders from './Renders'

export default function StatCard({ label, value }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
      <Renders name={`StatCard:${label}`} />
    </div>
  )
}