// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import EmailIcon from "../../assets/icons/InputIcons/EmailIcon";
import PasswordIcon from "../../assets/icons/InputIcons/PasswordIcon";
import PasswordCloseIcon from "../../assets/icons/InputIcons/PasswordCloseIcon";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";

export default function SignUp() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.username.trim()) next.username = "Username is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    if (!form.confirmPassword.trim())
      next.confirmPassword = "Confirm Password is required";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: call your API
      console.log("submit", form);
    }
  };

  return (
    <AuthLayout>
      <div className="login-card">
        <h1 className="title">Register Your Account!</h1>
        <p className="subtitle">Create an account to continue</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <InputField
            title="User Name"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Enter your username"
            required
            errorText={errors.username}
          />
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
          <InputField
            title="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
            required
            errorText={errors.confirmPassword}
          />

          <ButtonComponent type="submit" variant="primary">
            Send OTP
          </ButtonComponent>
        </form>

        <ButtonComponent variant="transparent" style={{ marginTop: "20px" }}>
          <img
            alt="Google"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="g-icon"
          />
          Login with Google
        </ButtonComponent>
        <div className="divider">
          <span>or</span>
        </div>
        <div className="muted">
          Already have an Account?{" "}
          <a className="link" href="/">
            Login in
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
