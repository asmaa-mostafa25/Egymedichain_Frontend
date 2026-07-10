import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import "./login-new.css";

const validateLoginForm = ({ email, password }) => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail) {
    return "Please enter your email";
  }

  if (!trimmedPassword) {
    return "Please enter your password";
  }

  return "";
};

export default function LoginNew() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // لو اليوزر اتحول لصفحة اللوجين من صفحة محمية، رجّعه لنفس الصفحة بعد الدخول
  const from = location.state?.from?.pathname || null;

  const handleLogin = async (event) => {
    event.preventDefault();
    clearError();

    const nextValidationError = validateLoginForm({ email, password });
    setValidationError(nextValidationError);

    if (nextValidationError) {
      return;
    }

    const result = await login({ email: email.trim(), password: password.trim() });

    if (result.success) {
      navigate(from || result.homeRoute, { replace: true });
    }
    // لو result.success === false، الرسالة بتظهر تلقائي من authStore عبر متغير error تحت
  };

  return (
    <div className="container">
      <div className="login-form_right">
        <h2>
          Sign <span>In</span>
        </h2>

        <h1 className="desc">
          <span>Authorized</span> personnel access only. Monitor, audit, and
          manage Egypt's pharmaceutical supply chain.
        </h1>

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <img
              src="/Frame 48 (1).png"
              alt="email icon"
              style={{ width: "20px", height: "20px" }}
            />

            <input
              type="email"
              placeholder="Please enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError("");
                clearError();
              }}
            />
          </div>

          <div className="input-box password-box">
            <img
              src="/Frame 48.png"
              alt="key"
              style={{ width: "20px", height: "20px" }}
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Please enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationError("");
                clearError();
              }}
            />

            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {validationError && <p className="error-message">{validationError}</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="options">
            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <a onClick={() => navigate("/forget-password")} className="forgot">
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="login-form_left">
        <img src="/image 2 .png" alt="login" />
      </div>
    </div>
  );
}