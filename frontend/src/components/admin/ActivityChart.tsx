type ActivitySummaryItem = {
  activity_type: string;
  count: number;
};

type Props = {
  activitySummary: ActivitySummaryItem[];
};

export const ActivityChart = ({ activitySummary }: Props) => {
  // Simple text-based vertical bar chart using CSS, to avoid extra chart libs
  const max = activitySummary.reduce((m, a) => Math.max(m, a.count), 0) || 1;

  return (
    <div className="activity-chart">
      <h3>Activity Breakdown</h3>
      <div className="activity-bars">
        {activitySummary.map((item) => {
          const height = (item.count / max) * 100;
          return (
            <div key={item.activity_type} className="activity-bar">
              <div
                className="activity-bar-fill"
                style={{ height: `${height}%` }}
                aria-label={`${item.activity_type} ${item.count}`}
              />
              <div className="activity-bar-label">{item.activity_type}</div>
              <div className="activity-bar-count">{item.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

