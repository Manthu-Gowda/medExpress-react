// src/pages/Auth/Login.jsx
import { useState } from "react";
import "./AuthStyles.scss";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import InputField from "../../components/InputField/InputField";
import AuthLayout from "../../components/AuthLayout/AuthLayout";
import { GOOGLE_LOGIN, REGISTER } from "../../utils/apiPath";
import { getApi, postApi } from "../../utils/apiService";
import { errorToast, successToast } from "../../services/ToastHelper";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";

const initialValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUp() {
  const [login, setLogin] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLogin({
      ...login,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateFields = () => {
    let errObj = { ...initialValues };

    if (!login.username) {
      errObj.username = "This field is required";
    } else {
      errObj.username = "";
    }

    if (!login.email) {
      errObj.email = "This field is required";
    } else if (/\s/.test(login.email)) {
      errObj.email = "Email should not contain spaces";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(login.email)) {
      errObj.email = "Please enter a valid email address";
    } else {
      errObj.email = "";
    }
    if (!login.password) {
      errObj.password = "This field is required";
    } else if (/\s/.test(login.password)) {
      errObj.password = "Password should not contain spaces";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(login.password)
    ) {
      errObj.password =
        "Password must be 8+ characters, with uppercase, lowercase, number, and special character.";
    } else {
      errObj.password = "";
    }

    if (!login.confirmPassword) {
      errObj.confirmPassword = "This field is required";
    } else if (login.password !== login.confirmPassword) {
      errObj.confirmPassword = "Passwords do not match";
    } else {
      errObj.confirmPassword = "";
    }

    setErrors((prev) => ({ ...prev, ...errObj }));
    const data = Object.values(errObj).every((x) => x === "" || x === null);
    return data;
  };

  const handleSubmit = async () => {
    if (!agreeTerms) {
      errorToast("Please accept the Terms & Conditions before proceeding.");
      return;
    }
    if (validateFields()) {
      setIsLoading(true);
      const payload = {
        userName: login.username,
        email: login.email,
        password: login.password,
      };
      const { statusCode, message } = await postApi(REGISTER, payload);
      if (statusCode === 200) {
        sessionStorage.setItem("pendingEmail", login.email);
        setIsLoading(false);
        successToast(message);
        navigate("/verification", { state: { email: login.email } });
      } else {
        setIsLoading(false);
        errorToast(message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await getApi(GOOGLE_LOGIN);
      const raw = res;
      const loginUrl =
        typeof raw === "string"
          ? raw
          : raw?.url || raw?.loginUrl || raw?.authorizationUrl;

      if (!loginUrl) {
        errorToast("Could not start Google Sign-In. Please try again.");
        return;
      }

      // 🚀 Direct full-page redirect (no popup)
      window.location.href = loginUrl;
    } catch (err) {
      errorToast("Failed to start Google Sign-In");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {isLoading && <Loader />}
      <div className="login-card">
        <h1 className="title">Register Your Account!</h1>
        <p className="subtitle">Create an account to continue</p>
        <div className="form">
          <InputField
            title="User Name"
            name="username"
            value={login.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            errorText={errors.username}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <InputField
            title="Email"
            name="email"
            type="text"
            value={login.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            errorText={errors.email}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <InputField
            title="Password"
            name="password"
            type="password"
            value={login.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            errorText={errors.password}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <InputField
            title="Confirm Password"
            name="confirmPassword"
            type="password"
            value={login.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            errorText={errors.confirmPassword}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

          <div className="terms-row">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Terms & Conditions
                </a>
              </span>
            </label>
          </div>
          <ButtonComponent
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={!agreeTerms}
          >
            Send OTP
          </ButtonComponent>
        </div>

        <ButtonComponent
          variant="transparent"
          style={{ marginTop: "20px", width: "100%" }}
          onClick={handleGoogleLogin}
        >
          <img
            alt="Google"
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="g-icon"
          />
          Sign In with Google
        </ButtonComponent>
        <div className="divider">
          <span>or</span>
        </div>
        <div className="muted">
          Already have an Account?{" "}
          <a className="link" href="/">
            Sign In
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
