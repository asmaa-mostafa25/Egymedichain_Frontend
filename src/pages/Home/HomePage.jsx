// src/pages/home/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import HealthcarePartners from '../../components/home/HealthcarePartners';
import HomeFooter from '../../components/home/HomeFooter';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTitleWrapper}>
          <h1 className={styles.heroTitleGhost} aria-hidden="true">
            Pharmaceutical Tracking System
          </h1>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleBlue}>Pharmaceutical</span>{' '}
            <span className={styles.heroTitleDark}>Tracking System</span>
          </h1>
        </div>

        <div className={styles.descriptionCard}>
          <p>
            Track, verify, and monitor medicine supply across Egypt.
            <br />
            Ensuring safety, transparency, and efficiency in healthcare.
          </p>
        </div>

        <img
          src="/images/home/home-building-bg.png"
          alt="Ministry of Health building"
          className={styles.heroCircleImage}
        />

        <button
          type="button"
          className={styles.dashboardButton}
          onClick={() => navigate('/dashboard')}
        >
          Go To your Dashboard
        </button>
      </section>

      <HealthcarePartners />
      <HomeFooter />
    </div>
  );
}