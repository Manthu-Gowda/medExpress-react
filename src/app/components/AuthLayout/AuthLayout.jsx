import "./AuthLayout.scss";
import AuthLogo from "../../assets/auth-logo.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth">
      <div className="auth_sec">
        <div className="auth_sec_logo">
          <img src={AuthLogo} alt="main-logo" />
        </div>
        <div className="auth_sec_card">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
