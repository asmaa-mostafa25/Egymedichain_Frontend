import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  Globe,
  ChevronDown,
  Settings,
  FileText,
  UserRound,
} from "lucide-react";

import {
  useAuthStore,
  useUIStore,
  useNotificationStore,
} from "../../store";

import { reportsApi } from "../../api";
import config from "../../config";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

const Topbar = () => {
  const navigate = useNavigate();

  const { user, role, logout } = useAuthStore();

  const { toggleMobileSidebar } = useUIStore();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    success,
    error: showError,
  } = useNotificationStore();

  const [language, setLanguage] = useState("EN");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] =
    useState(false);

  const initials = getInitials(
    user?.name || user?.email || "Admin"
  );

  const handleGenerateReport = async () => {
    setShowProfile(false);

    try {
      const response = await reportsApi.generate({
        type: "inventory",
        dateRange: "30d",
      });

      if (response.success) {
        success("Report generation started");
      } else {
        showError(
          response.message || "Failed to generate report"
        );
      }
    } catch (error) {
      showError(error.message);
    }

    navigate("/reports");
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout();
  };

  return (
    <>
      <header
        style={{
          height: 64,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,.07)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Menu */}
        <button
          onClick={toggleMobileSidebar}
          style={iconBtn}
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 420,
            position: "relative",
          }}
        >
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
            }}
          />

          <input
            type="search"
            placeholder="Search patients, appointments..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              background: "#F9FAFB",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Right Side */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Language */}
          <button
            onClick={() =>
              setLanguage(
                language === "EN" ? "AR" : "EN"
              )
            }
            style={{
              ...iconBtn,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Globe size={15} />
            <span>{language}</span>
            <ChevronDown size={12} />
          </button>

          <div
            style={{
              width: 1,
              height: 28,
              background: "#E5E7EB",
            }}
          />

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowNotifications(
                  !showNotifications
                );
                setShowProfile(false);
              }}
              style={iconBtn}
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#EF4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 350,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,.12)",
                  overflow: "hidden",
                  zIndex: 9999,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    display: "flex",
                    justifyContent:
                      "space-between",
                    borderBottom:
                      "1px solid #E5E7EB",
                  }}
                >
                  <strong>Notifications</strong>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={linkBtn}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: 350,
                    overflowY: "auto",
                  }}
                >
                  {notifications.length > 0 ? (
                    notifications
                      .slice(0, 10)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          style={{
                            padding: 14,
                            borderBottom:
                              "1px solid #F3F4F6",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            {notification.title}
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color: "#6B7280",
                              marginTop: 4,
                            }}
                          >
                            {
                              notification.message
                            }
                          </div>
                        </div>
                      ))
                  ) : (
                    <div
                      style={{
                        padding: 30,
                        textAlign: "center",
                        color: "#9CA3AF",
                      }}
                    >
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#1E3A5F",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>

              <div
                style={{
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {user?.name || "Admin"}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                  }}
                >
                  {config.ROLE_LABELS?.[role] ||
                    role}
                </div>
              </div>

              <ChevronDown size={12} />
            </button>

            {showProfile && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 280,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,.12)",
                  padding: 10,
                  zIndex: 9999,
                }}
              >
                <MenuItem
                  icon={<UserRound size={16} />}
                  text="View Profile"
                  onClick={() =>
                    navigate("/profile")
                  }
                />

                <MenuItem
                  icon={<Settings size={16} />}
                  text="Account Settings"
                  onClick={() =>
                    navigate("/settings")
                  }
                />

                <MenuItem
                  icon={<FileText size={16} />}
                  text="Generate PDF Report"
                  onClick={handleGenerateReport}
                />

                <hr />

                <MenuItem
                  danger
                  text="Logout"
                  onClick={handleLogout}
                />
              </div>
            )}
          </div>

         <img
  src="/images/logo.png"
  alt="Logo"
  style={{
    width: 60,
    height: 60,
    objectFit: "cover",
  }}
/>
        </div>
      </header>

      {(showNotifications || showProfile) && (
        <div
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
          }}
        />
      )}
    </>
  );
};

const MenuItem = ({
  icon,
  text,
  onClick,
  danger,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      border: "none",
      background: "transparent",
      borderRadius: 8,
      cursor: "pointer",
      color: danger ? "#DC2626" : "#111827",
      fontSize: 14,
    }}
  >
    {icon}
    {text}
  </button>
);

const iconBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#6B7280",
  borderRadius: 8,
  padding: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
};

const linkBtn = {
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "#2563EB",
  fontSize: 12,
};

export default Topbar;