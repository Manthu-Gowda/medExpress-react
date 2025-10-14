import { cloneElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./NewSidebar.scss";
import ProfileIcon from "../../assets/icons/navbarIcons/ProfileIcon";
import SettingsIcon from "../../assets/icons/navbarIcons/SettingsIcon";
import CardIcon from "../../assets/icons/navbarIcons/CardIcon";
import PatientsIcon from "../../assets/icons/navbarIcons/PatientsIcon";
import NavbarIcon from "../../assets/icons/navbarIcons/NavbarIcon";
import LogoutIcon from "../../assets/icons/navbarIcons/LogoutIcon";

const menuItems = [
  { text: "Patients", icon: <PatientsIcon />, path: "/patients" },
  { text: "Subscription", icon: <CardIcon />, path: "/applications" },
  { text: "Profile", icon: <ProfileIcon />, path: "/borrowers" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const NewSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <aside className={`sidebar1 ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar1_top">
        {!isCollapsed && <h1>Main Menu</h1>}
        <button
          className="sidebar1_toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
          aria-pressed={isCollapsed}
          type="button"
        >
          <NavbarIcon />
        </button>
      </div>

      <nav className="sidebar1_center" aria-label="Main">
        <ul className="sidebar1_center_menu">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            // Try to pass fillColor into your icon components (as shown in SettingsIcon).
            // If any icon doesn’t accept fillColor yet, update that icon component similarly.
            const coloredIcon = cloneElement(item.icon, {
              fillColor: isActive ? "#ffffff" : "#919CB4",
            });

            return (
              <li
                key={item.text}
                className={`sidebar1_center_menu_row ${isActive ? "active" : ""}`}
              >
                <button
                  type="button"
                  className={`sidebar1_center_menu_btn ${isActive ? "is-active" : ""}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar1_center_menu_icon">{coloredIcon}</span>

                  {!isCollapsed && (
                    <span className="sidebar1_center_menu_label">
                      {item.text}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar1_bottom">
        <button type="button" className="sidebar1_logout_btn">
          <span className="sidebar1_logout_text">Logout</span>
          <span className="sidebar1_logout_icon">
            <LogoutIcon />
          </span>
        </button>
      </div>
    </aside>
  );
};

export default NewSidebar;
