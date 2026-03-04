import { useEffect, useState } from "react";
import { AppShell } from "../AppShell";
import {
  fetchActivitySummary,
  fetchTopFacilities,
  fetchTotalUsers,
  fetchActivityHeatmap
} from "../services/adminApi";
import { StatsCards } from "../components/admin/StatsCards";
import { ActivityChart } from "../components/admin/ActivityChart";
import { TopFacilitiesTable } from "../components/admin/TopFacilitiesTable";
import { ActivityPieChart } from "../components/admin/ActivityPieChart";
import { ActivityHeatmap } from "../components/admin/ActivityHeatmap";

export const AdminDashboardPage = () => {
  const [adminToken, setAdminToken] = useState<string | null>(
    () => localStorage.getItem("ADMIN_TOKEN") || null
  );
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [activitySummary, setActivitySummary] = useState<any[]>([]);
  const [topFacilities, setTopFacilities] = useState<any[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<
    { latitude: number; longitude: number; weight: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    if (!adminToken) return;

    const load = async () => {
      try {
        const [usersRes, summaryRes, facilitiesRes, heatmapRes] = await Promise.all([
          fetchTotalUsers(adminToken),
          fetchActivitySummary(adminToken),
          fetchTopFacilities(adminToken),
          fetchActivityHeatmap(adminToken)
        ]);

        setTotalUsers(usersRes.total_users);
        setActivitySummary(summaryRes.activities);
        setTopFacilities(facilitiesRes.facilities);
        setHeatmapPoints(heatmapRes.points);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load admin data");
      }
    };

    load();
  }, [adminToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    localStorage.setItem("ADMIN_TOKEN", tokenInput.trim());
    setAdminToken(tokenInput.trim());
  };

  if (!adminToken) {
    return (
      <AppShell>
        <div className="admin-login">
          <h2>Admin Access</h2>
          <form onSubmit={handleTokenSubmit}>
            <input
              type="password"
              placeholder="Enter admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
            />
            <button type="submit">Enter</button>
          </form>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="admin-dashboard">
        {error && <div className="error-banner">{error}</div>}
        <StatsCards totalUsers={totalUsers} activitySummary={activitySummary} />
        <div className="admin-grid">
          <ActivityChart activitySummary={activitySummary} />
          <ActivityPieChart activitySummary={activitySummary} />
        </div>
        <div className="admin-grid">
          <TopFacilitiesTable facilities={topFacilities} />
          <ActivityHeatmap points={heatmapPoints} />
        </div>
      </div>
    </AppShell>
  );
};

