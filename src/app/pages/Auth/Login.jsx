// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import EmailIcon from "../../assets/icons/InputIcons/EmailIcon";
import PasswordIcon from "../../assets/icons/InputIcons/PasswordIcon";
import PasswordCloseIcon from "../../assets/icons/InputIcons/PasswordCloseIcon";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: call your API
      navigate("/patients");
      console.log("submit", form);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <h1 className="title">Welcome Back!</h1>
        <p className="subtitle">Please enter your details to continue</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <InputField
            title="Email"
            name="email"
            type="text"
            value={form.email}
            onChange={onChange}
            placeholder="Enter your email"
            required
            errorText={errors.email}
          />

          <InputField
            title="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Enter your password"
            required
            errorText={errors.password}
          />

          <div className="row between">
            <span />
            <a className="link" href="/forgot">
              Forgot Password ?
            </a>
          </div>

          <ButtonComponent type="submit" variant="primary">
            Sign In
          </ButtonComponent>
        </form>

        <div className="muted">
          Don’t have an Account?{" "}
          <a className="link" href="/">
            Sign Up
          </a>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <ButtonComponent variant="transparent" style={{width: "100%"}}>
          <img
            alt="Google"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="g-icon"
          />
          Login with Google
        </ButtonComponent>
      </div>
    </AuthLayout>
  );
}
