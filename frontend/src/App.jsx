import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GlobalStyles } from "./GlobalStyles";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalStyles />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
