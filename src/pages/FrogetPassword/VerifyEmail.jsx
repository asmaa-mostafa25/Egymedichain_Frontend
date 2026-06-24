import { useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import styles from './VerifyEmail.module.css'

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [digits, setDigits] = useState(['', '', '', ''])
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = val
    setDigits(newDigits)
    if (val && index < 3) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleBack = () => {
  navigate("/forget-password");
};
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    const newDigits = [...digits]
    pasted.split('').forEach((ch, i) => { newDigits[i] = ch })
    setDigits(newDigits)
    const nextEmpty = Math.min(pasted.length, 3)
    inputRefs[nextEmpty].current.focus()
  }

  const handleVerify = () => {
    const code = digits.join('')
    if (code.length < 4) {
      setError("Please enter the 4 digit code");
    } else {
      setError("");
      navigate("/reset-password");
    }
  }

  const handleResend = () => {
    setError("");
    setMessage("Verification code resent successfully!");
    setTimeout(() => {
      setMessage("");
    }, 5000);
  }

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
            <span className={styles.titleBlue}>Verify </span>
            <span className={styles.titleDark}>your email</span>
          </h1>
        </div>

        {/* Illustration */}
        <img
          src="public/images/verify-email-illustration.svg"
          alt="Verify email illustration"
          className={styles.illustration}
        />

        {/* Instruction */}
        <p className={styles.instruction}>
          Please enter 4 digit code that sent to your email address
        </p>

        {/* OTP inputs */}
        <div className={styles.otpRow}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={styles.otpInput}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Resend */}
        <p className={styles.resendRow}>
          <span className={styles.resendGray}>if you don't receive code ! </span>
          <span className={styles.resendLink} onClick={handleResend} role="button" tabIndex={0}>
            Resend
          </span>
          {message && <p className={styles.successMessage}>{message}</p>}
        </p>

        {/* Verify button */}
        <button className={styles.verifyBtn} onClick={handleVerify} type="button">
          Verify
        </button>

      </div>
    </div>
  )
}
