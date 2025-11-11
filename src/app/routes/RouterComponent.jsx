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
import AddOrEditPatients from "../pages/User/AddOrEditPatients/AddOrEditPatients";
import PaymentSuccess from "../pages/User/PaymentSuccess/PaymentSuccess";
import PaymentCancel from "../pages/User/PaymentCancel/PaymentCancel";
import SigninGoogle from "../pages/Auth/SigninGoogle";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import ManageMembers from "../pages/Admin/ManageMembers/ManageMembers";
import MedicalShippers from "../pages/Admin/MedicalShippers/MedicalShippers";
import PendingAssignees from "../pages/Admin/PendingAssignees/PendingAssignees";
import Notifications from "../pages/Admin/Notifications/Notifications";

const AppRoutes = () => (
  <Routes>
    <Route
      element={
        // <ProtectedRoute>
        <MainLayout />
        // </ProtectedRoute>
      }
    >
      //User Routes
      <Route path="/patients" element={<Patients />} />
      <Route path="/add-patients" element={<AddOrEditPatients />} />
      <Route path="/edit-patient/:id" element={<AddOrEditPatients />} />
      <Route path="/subscription" element={<Subscription />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      //Admin Routes
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/manage-members" element={<ManageMembers />} />
      <Route path="/medical-shippers" element={<MedicalShippers />} />
      <Route path="/pending-assignees" element={<PendingAssignees />} />
      <Route path="/notifications" element={<Notifications />} />
    </Route>
  </Routes>
);

const RouterComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/updating-status" element={<SigninGoogle />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<Reset />} />
        <Route path="/*" element={<AppRoutes />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterComponent;
