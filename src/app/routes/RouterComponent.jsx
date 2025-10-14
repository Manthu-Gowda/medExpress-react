import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../components/MainLayout/MainLayout";
import Login from "../pages/Auth/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import Patients from "../pages/User/Patients/Patients";

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
    </Route>
  </Routes>
);

const RouterComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterComponent;
