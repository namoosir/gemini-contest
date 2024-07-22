import { DashboardBarChart } from "../DashboardBarChart";
import { UserInfoCard } from "../UserInfoCard";
import { RadialChart } from "../RadialChart";

function Dashboard() {

  return (
    <div className="flex flex-col my-10">
      <div className="flex flex-row">
        <RadialChart />
        <UserInfoCard />
      </div>

      <DashboardBarChart />
    </div>
  );
}

export default Dashboard;
