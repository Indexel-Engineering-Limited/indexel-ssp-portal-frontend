const DOT_COLORS = ["#285598", "#0298CA", "#4085E4", "#36B37E"];

export default function OverviewStats({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="overview-stats" aria-label="Page summary">
      {items.map((item, index) => (
        <article className="overview-stat" key={item.label}>
          <div className="overview-stat-label">
            <span className="overview-stat-dot" style={{ backgroundColor: DOT_COLORS[index % DOT_COLORS.length] }} />
            {item.label}
          </div>
          <div className="overview-stat-value">{item.value}</div>
          {item.detail && <div className="overview-stat-detail">{item.detail}</div>}
        </article>
      ))}
    </section>
  );
}
