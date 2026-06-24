import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import styles from './ForgetPassword.module.css'

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <polyline points="2,4 12,13 22,4" />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (value) => {
    if (!value.trim()) return 'Please enter your email address.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      setSuccess(false)
      return
    }
    setError('')
    setSuccess(true)
    console.log('Recovery email sent to:', email)

    setTimeout(() => {
    navigate("/verify-email");
  }, 500);
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (success) setSuccess(false)
  }
const handleBack = () => {
  navigate("/login");
};
  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* Title row with back arrow */}
        <div className={styles.titleRow}>
          <button
            className={styles.backButtonInline}
            onClick={handleBack}
            aria-label="Go back"
            type="button"
          >
            <BackArrowIcon />
          </button>

          <h1 className={styles.title}>
            <span className={styles.titleBlue}>Forget </span>
            <span className={styles.titleDark}>Password ?</span>
          </h1>
        </div>

        {/* Illustration — 267×205px */}
        <img
          src="public/images/security-illustration.svg"
          alt="Security illustration"
          className={styles.illustration}
        />

        {/* Instruction */}
        <p className={styles.instructionText}>
          Please enter your registered email
        </p>

        {/* Description */}
        <p className={styles.descriptionText}>
          We will&nbsp; send a verification code to your registered email
        </p>

        {/* Email input */}
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}><EmailIcon /></span>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
            aria-label="Email address"
          />
        </div>

        {error && <p className={styles.errorMessage} role="alert">{error}</p>}

        {/* Recover button */}
        <button className={styles.recoverButton} onClick={handleSubmit} type="button">
          Recover Password
        </button>

        {success && (
          <p className={styles.successMessage} role="status">
            ✓ Recovery email sent to {email}
          </p>
        )}

      </div>
    </div>
  )
}
