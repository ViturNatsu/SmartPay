import { useState } from "react";
import axios from "axios";
export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("passwords do not match. ");
      return;
    }

    const userInfo = {
      email: email,
      password: password,
    };
    const api = "http://localhost:8080/api/v1/registration";

    const auth = {
      username: "admin",
      password: "admin",
    };
    axios
      .post(api, userInfo, auth)
      .then((response) => {
        console.log("success");
      })
      .catch((error) => {
        console.log("error");
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInvalid={(e) =>
            e.target.setCustomValidity(
              "Enter a valid email address (example: name@domain.com).",
            )
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};
