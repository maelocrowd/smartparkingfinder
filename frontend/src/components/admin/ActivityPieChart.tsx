type ActivitySummaryItem = {
  activity_type: string;
  count: number;
};

type Props = {
  activitySummary: ActivitySummaryItem[];
};

export const ActivityPieChart = ({ activitySummary }: Props) => {
  const total = activitySummary.reduce((sum, a) => sum + a.count, 0) || 1;

  let cumulative = 0;
  const segments = activitySummary.map((item) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    const slice = (item.count / total) * 2 * Math.PI;
    cumulative += item.count;
    const endAngle = (cumulative / total) * 2 * Math.PI;

    const radius = 40;
    const cx = 50;
    const cy = 50;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = slice > Math.PI ? 1 : 0;

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z"
    ].join(" ");

    return { item, d };
  });

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#f97316",
    "#e11d48",
    "#a855f7",
    "#0ea5e9"
  ];

  return (
    <div className="activity-pie">
      <h3>Activity Breakdown (Pie)</h3>
      <div className="activity-pie-content">
        <svg viewBox="0 0 100 100" className="activity-pie-svg">
          {segments.map(({ item, d }, idx) => (
            <path
              key={item.activity_type}
              d={d}
              fill={colors[idx % colors.length]}
            />
          ))}
        </svg>
        <ul className="activity-pie-legend">
          {activitySummary.map((item, idx) => (
            <li key={item.activity_type}>
              <span
                className="legend-color"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="legend-label">
                {item.activity_type} ({item.count})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

