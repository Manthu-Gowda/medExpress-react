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
import DashboardIcon from "../../assets/icons/navbarIcons/DashboardIcon";
import NotificationSideNavIcon from "../../assets/icons/navbarIcons/NotificationSideNavIcon";
import MedicalShippersIcon from "../../assets/icons/navbarIcons/MedicalShippersIcon";
import PendingIcon from "../../assets/icons/navbarIcons/PendingIcon";
import CustomModal from "../CustomModal/CustomModal";

const { useBreakpoint } = Grid;

const MENUS_BY_ROLE = {
  User: [
    {
      key: "patients",
      text: "Patients",
      icon: <PatientsIcon />,
      path: "/patients",
    },
    {
      key: "subscription",
      text: "Orders",
      icon: <CardIcon />,
      path: "/orders",
    },
    {
      key: "profile",
      text: "Profile",
      icon: <ProfileIcon />,
      path: "/profile",
    },
    {
      key: "settings",
      text: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
    },
  ],
  Admin: [
    {
      key: "dashboard",
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
    {
      key: "manage-users",
      text: "Manage Users",
      icon: <PatientsIcon />,
      path: "/manage-users",
    },
    {
      key: "admin-patients",
      text: "Manage Patients",
      icon: <PatientsIcon />,
      path: "/admin-patients",
    },
    {
      key: "medical-shippers",
      text: "Manage Medical Shippers",
      icon: <MedicalShippersIcon />,
      path: "/medical-shippers",
    },
    {
      key: "profile",
      text: "Pending Assignees",
      icon: <PendingIcon />,
      path: "/pending-assignees",
    },
    {
      key: "notifications",
      text: "Notifications",
      icon: <NotificationSideNavIcon />,
      path: "/notifications",
    },
  ],
  Shipper: [
    {
      key: "medical-shipments",
      text: "Medical Shipments",
      icon: <MedicalShippersIcon />,
      path: "/medical-shipments",
    },
    {
      key: "shipper-profile",
      text: "Profile",
      icon: <ProfileIcon />,
      path: "/shipper-profile",
    },
  ],
};

const DEFAULT_MENU = MENUS_BY_ROLE.User;

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [tick, setTick] = useState(0);
  const screens = useBreakpoint();
  const isPhone = !screens.md;

  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = sessionStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const userRole = sessionStorage.getItem("role");

  useEffect(() => {
    const refresh = () => setTick((v) => v + 1);
    window.addEventListener("session-user-updated", refresh);
    return () => window.removeEventListener("session-user-updated", refresh);
  }, []);

  useEffect(() => {
    setIsCollapsed(isPhone);
  }, [isPhone]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const openLogoutConfirm = () => setShowLogoutModal(true);
  const closeLogoutConfirm = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    // actual logout
    sessionStorage.clear();
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleProfilePage = () => {
    navigate("/profile");
  };

  const menuItems = useMemo(() => {
    return MENUS_BY_ROLE[userRole] || DEFAULT_MENU;
  }, [userRole]);

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
              onClick={openLogoutConfirm}
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
              <img
                src={userData.profilePicture || DummyUser}
                alt="User Avatar"
                className="user_avatar"
              />
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
                onClick={openLogoutConfirm}
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

      <CustomModal
        open={showLogoutModal}
        title="Confirm Logout"
        onClose={closeLogoutConfirm}
        showPrimary={true}
        showDanger={true}
        primaryText="Logout"
        dangerText="Cancel"
        onPrimary={confirmLogout}
        onDanger={closeLogoutConfirm}
        primaryProps={{ variant: "danger" }} // makes primary look destructive if your Button supports it
        maskClosable={false}
        centered
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to logout? You’ll need to sign in again to
          continue.
        </p>
      </CustomModal>
    </div>
  );
};

export default MainLayout;
