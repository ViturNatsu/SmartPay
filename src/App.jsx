import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import { GlobalStyles } from './GlobalStyles';
export default function App() {
  return (
    <Router>
      <GlobalStyles />
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
          <Route path="/verify-email" element={<VerifyEmail/>}/>
          <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
          </Route>
        </Routes>
    </Router>
  );
}