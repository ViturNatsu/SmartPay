import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { VerifyOtp } from "./pages/VerifyOtp";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Home } from "./pages/Home";
import { Accounts } from './pages/Accounts';
import { Transactions } from './pages/Transactions';
import { Cards } from './pages/Cards';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { CreateAccount } from "./pages/CreateAccount";
import { AddPayee } from "./pages/AddPayee";
import { MakeAPayment } from "./pages/MakeAPayment";
import { ViewHistory } from "./pages/ViewHistory";
import TermsAndConditions from './pages/TermsAndConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify" element={<VerifyOtp />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/view-history" element={<ViewHistory />} />
        <Route path="/make-a-payment" element={<MakeAPayment />} />
        <Route path="/add-payee" element={<AddPayee />} />
      </Route>
    </Routes>
  );
}
