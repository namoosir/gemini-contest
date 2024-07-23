import { DashboardBarChart } from "../DashboardBarChart";
import { UserInfoCard } from "../UserInfoCard";
import { RadialChart } from "../RadialChart";

function Dashboard() {
  return (
    <div className="flex flex-col m-10">
      <div className="flex flex-row">
        <div className="pr-20">
          <RadialChart />
        </div>
        <UserInfoCard />
      </div>

      <DashboardBarChart />
    </div>
  );
}

export default Dashboard;
