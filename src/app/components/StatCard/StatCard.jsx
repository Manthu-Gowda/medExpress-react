import React from "react";
import "./StatCard.scss";

const StatCard = ({ title, value, Icon, iconColor = "#ffffff", className = "" }) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card__icon">
        {Icon ? <Icon fillColor={iconColor} /> : null}
      </div>

      <div className="stat-card__meta">
        <span className="stat-card__label">{title}</span>
        <span className="stat-card__value">{value}</span>
      </div>
    </div>
  );
};

export default StatCard;
