import React from "react";
import "./Dashboard.scss";

import CardIcon from "../../../assets/icons/navbarIcons/CardIcon";
import StatCard from "../../../components/StatCard/StatCard";
import PendingIcon from "../../../assets/icons/navbarIcons/PendingIcon";
import PatientsIcon from "../../../assets/icons/navbarIcons/PatientsIcon";
import MedicalShippersIcon from "../../../assets/icons/navbarIcons/MedicalShippersIcon";

const Dashboard = () => {
  const cards = [
    { title: "Total Users", value: "25,267", Icon: PatientsIcon },
    { title: "Total Medical Shippers", value: "2,267", Icon: MedicalShippersIcon },
    { title: "Active Subscriptions", value: "2,558", Icon: CardIcon },
    { title: "Pending Assignees", value: "425", Icon: PendingIcon },
  ];

  return (
    <div className="dashboard">
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
