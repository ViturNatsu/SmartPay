import { GlobalStyles } from "./GlobalStyles";
import { AuthProvider } from "./context/AuthContext";

import { BrowserRouter } from "react-router-dom";

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
