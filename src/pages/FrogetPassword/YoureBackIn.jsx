import styles from './YoureBackIn.module.css'
import { useNavigate } from "react-router-dom";

export default function YoureBackIn() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div className={styles.page}>
      <div className={styles.content}>

        {/* Title */}
        <h1 className={styles.title}>You're Back In!</h1>

        {/* Illustration */}
        <img
          src="/images/youre-back-in-illustration.svg"
          alt="You're back in illustration"
          className={styles.illustration}
        />

        {/* Description */}
        <p className={styles.description}>
          Your password has been successfully updated. Click below to log in
        </p>

        {/* Login button */}
        <button
          className={styles.loginBtn}
          onClick={handleLogin}
          type="button"
        >
          Log in
        </button>

      </div>
    </div>
  )
}
