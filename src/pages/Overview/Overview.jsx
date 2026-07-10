// src/pages/HomePage/HomePage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const modules = [
  {
    image: "/images/manufacturing.png",
    title: "Manufacturing",
    // subtitle: "Production Facility",
    route: "/entities-management?tab=factories",
  },
  {
    image: "/images/storage.png",
    title: "Storage",
    // subtitle: "Central Warehouse",
    route: "/entities-management?tab=warehouses",
  },
  {
    image: "/images/pharmacy.png",
    title: "Pharmacy",
    // subtitle: "Point of Sale",
    route: "/entities-management?tab=pharmacies",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: "#f1f4f9",
      minHeight: "100vh",
      padding: "40px 40px 60px",
      boxSizing: "border-box",
    }}>

      {/* Hero Title */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "52px",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-1px",
          margin: 0,
        }}>
          <span style={{ color: "#1a4fc4" }}>Pharmaceutical</span>{" "}
          <span style={{ color: "#0d0d0d" }}>Tracking System</span>
        </h1>
      </div>

      {/* Description Box */}
      <div style={{
        maxWidth: "680px",
        margin: "0 auto 48px",
        background: "#f8f9fb",
        borderRadius: "20px",
        border: "2px solid #d0d7e6",
        padding: "24px 40px",
        textAlign: "center",
        boxSizing: "border-box",
      }}>
        <p style={{ fontSize: "17px", color: "#222", lineHeight: 1.75, margin: 0 }}>
          Track, verify, and monitor medicine supply across Egypt.<br />
          Ensuring safety, transparency, and efficiency in healthcare.
        </p>
      </div>

      {/* Quick Access Modules */}
      <section>
        <h2 style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "28px",
        }}>
          <span style={{ color: "#1a4fc4" }}>Quick</span>{" "}
          <span style={{ color: "#0d0d0d" }}>Access Modules</span>
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          maxWidth: "900px",
          margin: "0 auto",
        }}>
          {modules.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.route)}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "3 / 4",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                cursor: "pointer",
                transition: "transform 0.25s, box-shadow 0.25s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,0.22)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Gradient */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.08) 45%, transparent 100%)",
              }} />

              {/* Label */}
              <div style={{ position: "absolute", bottom: "16px", left: "16px", color: "#fff" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 800, margin: 0 }}>{item.title}</h3>
                <p style={{ fontSize: "13px", opacity: 0.85, margin: "4px 0 0" }}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}