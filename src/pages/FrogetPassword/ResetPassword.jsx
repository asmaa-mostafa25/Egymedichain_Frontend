  import { useState } from 'react'
  import { useNavigate } from "react-router-dom";
import styles from "./ResetPassword.module.css"

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function ResetPassword() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    if (!newPassword || !confirmPassword) {
          setError("Please fill in all password fields");
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return
    }
      setError("");
    navigate("/youre-back-in");
  }
  const handleBack = () => {
  navigate("/verify-email");
};
  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* Title row */}
        <div className={styles.titleRow}>
          <button
            className={styles.backBtn}
            onClick={handleBack}
            aria-label="Go back"
            type="button"
          >
            <BackArrowIcon />
          </button>
          <h1 className={styles.title}>
            <span className={styles.titleBlue}>Reset </span>
            <span className={styles.titleDark}>Password</span>
          </h1>
        </div>

        {/* Illustration */}
        <img
          src="public/images/reset-password-illustration.svg"
          alt="Reset password illustration"
          className={styles.illustration}
        />

        {/* Instruction */}
        <p className={styles.instruction}>
          Your new password must be different from previously used password
        </p>

        {/* New password input */}
        <div className={styles.inputWrapper}>
          <span className={styles.iconLeft}><LockIcon /></span>
          <input
            type={showNew ? 'text' : 'password'}
            className={styles.input}
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-label="New password"
          />
          
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowNew(!showNew)}
            aria-label="Toggle password visibility"
          >
            {showNew ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>

        {/* Confirm password input */}
        <div className={styles.inputWrapper}>
          <span className={styles.iconLeft}><LockIcon /></span>
          <input
            type={showConfirm ? 'text' : 'password'}
            className={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label="Confirm password"
          />
          <button
            type="button"
            className={styles.iconRight}
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirm ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {/* Reset button */}
        <button className={styles.resetBtn} onClick={handleReset} type="button">
          Reset
        </button>

      </div>
    </div>
  )
}
