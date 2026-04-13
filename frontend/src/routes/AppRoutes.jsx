import { Routes, Route } from "react-router-dom";
import { Login } from "@/pages/Login/Login";
import { Register } from "@/pages/Registration/Register";
import { ForgotPassword } from "@/pages/Password/ForgotPassword";
import { ResetPassword } from "@/pages/Password/ResetPassword";
import { VerifyEmail } from "@/pages/Verify/VerifyEmail";
import { VerifyOtp } from "@/pages/Verify/VerifyOtp";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { Home } from "@/pages/Navbar/Home";
import { Accounts } from "@/pages/Accounts/Accounts";
import { Transactions } from "@/pages/Navbar/Transactions";
import { Cards } from "@/pages/Navbar/Cards";
import { Reports } from "@/pages/Navbar/Reports";
import { Settings } from "@/pages/Navbar/Settings";
import { CreateAccount } from "@/pages/Accounts/CreateAccount";
import { AddPayee } from "@/pages/Accounts/AddPayee";
import { MakeAPayment } from "@/pages/Accounts/MakeAPayment";
import { ViewHistory } from "@/pages/Accounts/ViewHistory";
import AccountDetails from "../pages/Accounts/AccountDetails";
import PaymentMethods from "@/pages/PaymentMethods/PaymentMethods";
import TermsAndConditions from "@/pages/Registration/TermsAndConditions";
import PrivacyPolicy from "@/pages/Registration/PrivacyPolicy";
import AdminDash from "@/pages/Admin/AdminDash";
import Forbidden from "@/pages/errors/Forbidden";
import MockAccounts from "../pages/Admin/MockAccounts";
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
      <Route path="/forbidden" element={<Forbidden />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:accountId" element={<AccountDetails />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/view-history" element={<ViewHistory />} />
        <Route path="/make-a-payment" element={<MakeAPayment />} />
        <Route path="/add-payee" element={<AddPayee />} />
      </Route>

      {/* admin-only area */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDash />} />
        <Route path="/admin/mock-accounts" element={<MockAccounts />} />
      </Route>
    </Routes>
  );
}
