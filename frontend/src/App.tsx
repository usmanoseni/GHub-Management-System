import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/gym_owner/dashboard";
import ForgetPassword from "./pages/Forget_password";
import Reset_password from "./pages/Reset_password";
import SignUpPage from "./pages/SignUpPage";
import Gym_center from "./pages/Gym_center";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v1/auth/login" element={<LoginPage />} />
        <Route path="/owner/dashboard" element={<Dashboard />} />
        <Route path="/v1/auth/forget-password" element={<ForgetPassword />} />
        <Route path="/v1/auth/reset-password" element={<Reset_password />} />
        <Route path="/v1/auth/register" element={<SignUpPage />} />
        <Route path="/v1/gym-center" element={<Gym_center />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
