import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/MainLayout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Patients from "../pages/User/Patients/Patients";
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/Signup";
import Forgot from "../pages/Auth/Forgot";
import Reset from "../pages/Auth/Reset";
import Verification from "../pages/Auth/verification";
import Subscription from "../pages/User/Subscription/Subscription";
import Profile from "../pages/User/Profile/Profile";
import Settings from "../pages/User/Settings/Settings";

const AppRoutes = () => (
  <Routes>
    <Route
      element={
        // <ProtectedRoute>
        <MainLayout />
        // </ProtectedRoute>
      }
    >
      <Route path="/patients" element={<Patients />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />

    </Route>
  </Routes>
);

const RouterComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterComponent;
