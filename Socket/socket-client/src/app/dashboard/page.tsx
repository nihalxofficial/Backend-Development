import DashboardClient from "@/components/DashboardClient";
import { getAnalytics, getTopStudents } from "@/lib/students/data";

export default async function AnalyticsPage() {
  const stats = await getAnalytics();
  const topPerformers = await getTopStudents();

  return (
    <DashboardClient
      stats={stats}
      topPerformers={topPerformers}
    />
  );
}