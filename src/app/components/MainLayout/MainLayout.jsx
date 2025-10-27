// MainLayout.jsx
import { cloneElement, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./MainLayout.scss";
import { Grid } from "antd";

import Logo from "../../assets/Logo.png";
import DummyUser from "../../assets/SampleUser.jpg";

// Icons
import NotificationIcon from "../../assets/icons/navbarIcons/NotificationIcon";
import DownArrowIcon from "../../assets/icons/navbarIcons/DownArrowIcon";
import ProfileIcon from "../../assets/icons/navbarIcons/ProfileIcon";
import SettingsIcon from "../../assets/icons/navbarIcons/SettingsIcon";
import CardIcon from "../../assets/icons/navbarIcons/CardIcon";
import PatientsIcon from "../../assets/icons/navbarIcons/PatientsIcon";
import NavbarIcon from "../../assets/icons/navbarIcons/NavbarIcon";
import LogoutIcon from "../../assets/icons/navbarIcons/LogoutIcon";

const { useBreakpoint } = Grid;

const menuItems = [
  {
    key: "patients",
    text: "Patients",
    icon: <PatientsIcon />,
    path: "/patients",
  },
  {
    key: "subscription",
    text: "Subscription",
    icon: <CardIcon />,
    path: "/subscription",
  },
  { key: "profile", text: "Profile", icon: <ProfileIcon />, path: "/profile" },
  {
    key: "settings",
    text: "Settings",
    icon: <SettingsIcon />,
    path: "/settings",
  },
];

const BASE_URL = "https://vibhu-solutions.s3.ap-south-1.amazonaws.com/";

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isPhone = !screens.md;

  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = sessionStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userRole = sessionStorage.getItem("role");

  useEffect(() => {
    setIsCollapsed(isPhone);
  }, [isPhone]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleProfilePage = () => {
    navigate("/profile");
  };

  const activeKey = useMemo(
    () =>
      menuItems.find((m) => location.pathname.startsWith(m.path))?.key ?? "",
    [location.pathname]
  );

  return (
    <div className={`mainlayout ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar: hidden on mobile, shown on desktop */}
      {!isPhone && (
        <aside
          className={`sidebar1 ${isCollapsed ? "collapsed" : ""}`}
          aria-label="Main sidebar"
        >
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
                const isActive = location.pathname.startsWith(item.path);
                const coloredIcon = cloneElement(item.icon, {
                  fillColor: isActive ? "#ffffff" : "#919CB4",
                });

                return (
                  <li
                    key={item.text}
                    className={`sidebar1_center_menu_row ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={`sidebar1_center_menu_btn ${
                        isActive ? "is-active" : ""
                      }`}
                      onClick={() => navigate(item.path)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="sidebar1_center_menu_icon">
                        {coloredIcon}
                      </span>
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
            <button
              type="button"
              className="sidebar1_logout_btn"
              onClick={handleLogout}
            >
              <span className="sidebar1_logout_text">Logout</span>
              <span className="sidebar1_logout_icon">
                <LogoutIcon />
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Right pane */}
      <div className="mainlayout_right">
        {/* Header */}
        <header className="mainlayout_header">
          <div className="header_left">
            {/* On mobile you can show a small toggle if you later want a drawer — keeping icon for parity */}
            {/* {isPhone ? (
              <button
                className="header_navbtn"
                type="button"
                aria-label="Menu"
                onClick={() => navigate("/patients")}
              >
                <NavbarIcon />
              </button>
            ) : null} */}

            <div className="brand">
              <img src={Logo} alt="MedExpress" className="brand_logo" />
              <span className="brand_name">MedExpress</span>
            </div>
          </div>

          <div className="header_right">
            {/* <button className="icon_btn" aria-label="Notifications" type="button">
              <NotificationIcon />
            </button> */}

            {/* User chip: on mobile we hide meta (name/role) via CSS; avatar remains tappable */}
            <button
              className="user_btn"
              type="button"
              onClick={handleProfilePage}
            >
              <img src={userData.profilePicture || DummyUser} alt="User Avatar" className="user_avatar" />
              <div className="user_meta">
                <span className="user_name">
                  {userData?.userName || "Guest"}
                </span>
                <span className="user_role">{userRole || "User"}</span>
              </div>
              {/* <span className="user_caret">
                <DownArrowIcon />
              </span> */}
            </button>

            {/* Mobile-only logout button in header */}
            {isPhone && (
              <button
                className="icon_btn logout_btn_mobile"
                aria-label="Logout"
                type="button"
                onClick={handleLogout}
                title="Logout"
              >
                <LogoutIcon />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="mainlayout_content">
          <Outlet />
        </main>

        {/* Mobile Dock (fixed bottom) */}
        {isPhone && (
          <nav className="mobile-dock" aria-label="Bottom navigation">
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              const coloredIcon = cloneElement(item.icon, {
                fillColor: isActive ? "#0e82fd" : "#7e8aa6",
              });
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`mobile-dock__btn ${isActive ? "is-active" : ""}`}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="mobile-dock__icon">{coloredIcon}</span>
                  <span className="mobile-dock__label">{item.text}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
