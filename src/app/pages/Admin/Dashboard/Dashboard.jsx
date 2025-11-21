import React, { useEffect, useState } from "react";
import "./Dashboard.scss";

import CardIcon from "../../../assets/icons/navbarIcons/CardIcon";
import StatCard from "../../../components/StatCard/StatCard";
import PendingIcon from "../../../assets/icons/navbarIcons/PendingIcon";
import PatientsIcon from "../../../assets/icons/navbarIcons/PatientsIcon";
import MedicalShippersIcon from "../../../assets/icons/navbarIcons/MedicalShippersIcon";
import { GET_DASHBOARD_DATA } from "../../../utils/apiPath";
import Loader from "../../../components/Loader/Loader";
import { getApi } from "../../../utils/apiService";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { statusCode, data } = await getApi(GET_DASHBOARD_DATA);
    if (statusCode === 200) {
      setDashboardData(data);
    } else {
      setDashboardData({});
    }
    setIsLoading(false);
  };

  const cards = [
    {
      title: "Total Members",
      value: dashboardData.totalMembersCount ?? 0,
      Icon: PatientsIcon,
    },
    // {
    //   title: "Total Medical Shippers",
    //   value: dashboardData.totalMembersCount ?? 0,
    //   Icon: MedicalShippersIcon,
    // },
    {
      title: "Active Subscriptions",
      value: dashboardData.totalActiveSubscriptionsCount ?? 0,
      Icon: CardIcon,
    },
    {
      title: "Total Patients",
      value: dashboardData.totalPatientsCount ?? 0,
      Icon: PatientsIcon,
    },
    // {
    //   title: "Pending Assignees",
    //   value: 425,
    //   Icon: PendingIcon,
    // },
  ];

  return (
    <div className="dashboard">
      {isLoading && <Loader />}
      <div className="dashboard__top">
        <div className="stat-grid">
          {cards.map((c) => (
            <StatCard
              key={c.title}
              title={c.title}
              value={c.value}
              Icon={c.Icon}
              iconColor="#ffffff"
            />
          ))}
        </div>
      </div>

      <div className="dashboard__bottom">
        {/* Your charts / tables go here */}
      </div>
    </div>
  );
};

export default Dashboard;
