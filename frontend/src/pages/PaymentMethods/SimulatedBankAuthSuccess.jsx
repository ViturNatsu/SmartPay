import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function SimulatedBankAuthSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/payment-methods"); // todo: change route
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div>
      <Navbar/>
      <h1>✅ Success!</h1>
      <p>Redirecting to payment methods in {countdown}s...</p>
    </div>
  );
}
export default SimulatedBankAuthSuccess;