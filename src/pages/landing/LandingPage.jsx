// src/pages/landing/LandingPage.jsx
import { useNavigate } from 'react-router-dom';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleScanQr = () => {
    // Real QR scanning is a future phase - no scanner library added yet.
    alert('QR scanner will be available soon');
  };

  return (
    <main className={styles.page}>
      <div className={styles.overlay} />

      <header className={styles.header}>
        <img
          src="/images/home/egymed-logo.svg"
          alt="EGY MED CHAIN logo"
          className={styles.logo}
        />

        <div className={styles.ministryArea}>
          <button type="button" className={styles.languageSelector}>
            <FaGlobe aria-hidden="true" />
            <span>EN</span>
            <FaChevronDown aria-hidden="true" className={styles.chevron} />
          </button>

          <div className={styles.ministryText}>
            <span className={styles.ministryTextAr}>وزارة الصحة والسكان</span>
            <span className={styles.ministryTextEn}>Ministry of Health &amp; Population</span>
          </div>

          <img
            src="/images/home/ministry-logo.png"
            alt="Ministry of Health and Population logo"
            className={styles.ministryLogo}
          />
        </div>
      </header>

      <section className={styles.content}>
        <h1 className={styles.title}>
          EGYPT VISION 2030
        </h1>

        <button type="button" className={styles.pillButton} onClick={handleScanQr}>
          Scan Qr Code
        </button>

        <p className={styles.subtitle}>
          EGY MED CHAIN &ndash; Smart Pharmaceutical Tracking for Egypt Vision 2030
        </p>

        <div className={styles.authActions}>
          <button type="button" className={styles.pillButton} onClick={() => navigate('/login')}>
            Login
          </button>
          <button
            type="button"
            className={styles.pillButton}
            onClick={() => navigate('/register/account')}
          >
            Sign Up
          </button>
        </div>
      </section>
    </main>
  );
}