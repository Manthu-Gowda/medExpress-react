// src/pages/Auth/SigninGoogle.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../../utils/apiService";
import { GOOGLE_AUTH } from "../../utils/apiPath";
import { saveAuthToSession } from "../../services/auth";
import { successToast, errorToast } from "../../services/ToastHelper";
import Loader from "../../components/Loader/Loader";

export default function SigninGoogle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doGoogleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error") || params.get("error_description");

      if (error) {
        errorToast(error);
        navigate("/login");
        return;
      }

      if (!code) {
        errorToast("Missing authorization code. Please try again.");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Call your backend with the code
        const { statusCode, data, message } = await postApi(GOOGLE_AUTH, {
          code,
          ...(state ? { state } : {}),
        });

        if (statusCode === 200 && data) {
          saveAuthToSession(data);
          successToast("Signed in with Google");
          navigate("/patients");
        } else {
          errorToast(message || "Google authentication failed");
          navigate("/login");
        }
      } catch (e) {
        errorToast("Google Sign-In failed");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    doGoogleAuth();
  }, [navigate]);

  return (
    <div className="google-auth-loader">
      {loading ? <Loader /> : <div>Completing Google sign-in…</div>}
    </div>
  );
}
