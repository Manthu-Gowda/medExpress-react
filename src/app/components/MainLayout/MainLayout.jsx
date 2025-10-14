// CustomLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import "./MainLayout.scss";
import { useEffect, useState } from "react";
import { Grid } from "antd";
import Sidebar from "../Sidebar/Sidebar";
import Logo from "../../assets/Logo.png";
import DummyUser from "../../assets/DummyUser.png";
import NotificationIcon from "../../assets/icons/navbarIcons/NotificationIcon";
import DownArrowIcon from "../../assets/icons/navbarIcons/DownArrowIcon";

const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const location = useLocation();

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className={`mainlayout ${isCollapsed ? "collapsed" : ""}`}>
      <div className="mainlayout_left">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className="mainlayout_right">
        {/* Header */}
        <header className="mainlayout_header">
          <div className="header_left">
            <div className="brand">
              <img src={Logo} alt="MedExpress" className="brand_logo" />
              <span className="brand_name">MedExpress</span>
            </div>
          </div>

          <div className="header_right">
            <button
              className="icon_btn"
              aria-label="Notifications"
              type="button"
            >
              <NotificationIcon />
            </button>

            {/* User chip / menu trigger */}
            <button className="user_btn" type="button">
              <img src={DummyUser} alt="User Avatar" className="user_avatar" />
              <div className="user_meta">
                <span className="user_name">Brahim elabbaoui</span>
                <span className="user_role">User</span>
              </div>
              <span className="user_caret">
                <DownArrowIcon />
              </span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mainlayout_content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
