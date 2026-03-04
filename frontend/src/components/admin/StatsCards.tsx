type ActivitySummaryItem = {
  activity_type: string;
  count: number;
};

type Props = {
  totalUsers: number | null;
  activitySummary: ActivitySummaryItem[];
};

export const StatsCards = ({ totalUsers, activitySummary }: Props) => {
  const totalActivities = activitySummary.reduce((sum, a) => sum + a.count, 0);

  const lookup = (type: string) =>
    activitySummary.find((a) => a.activity_type === type)?.count || 0;

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-label">Total Users</div>
        <div className="stat-value">{totalUsers ?? "-"}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Activities</div>
        <div className="stat-value">{totalActivities}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Searches</div>
        <div className="stat-value">{lookup("SEARCH")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Nearby Searches</div>
        <div className="stat-value">{lookup("NEARBY_SEARCH")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Geolocation Uses</div>
        <div className="stat-value">{lookup("GEOLOCATION")}</div>
      </div>
    </div>
  );
};

