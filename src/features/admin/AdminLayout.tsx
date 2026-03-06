import { useState, useEffect, FC, ReactNode, MouseEvent } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface IconProps {
  children: ReactNode;
  size?: number;
}

interface SidebarProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavbarProps {
  onMobileMenuToggle: () => void;
  isMobileOpen: boolean;
}

interface MainLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  title: string;
  href: string;
}

interface StatCard {
  label: string;
  value: string;
  delta: string;
  color: string;
}

interface Notification {
  text: string;
  time: string;
  dot: string;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────

const Icon: FC<IconProps> = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

const CubeIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <Icon size={size}>
    <path opacity="0.35" d="M11.8 5.2L17.7 8.6V15.4L11.8 18.8L5.9 15.4V8.6L11.8 5.2Z" fill="currentColor" />
    <path d="M11.8 8.7L8.9 10.3V13.7L11.8 15.3L14.7 13.7V10.3L11.8 8.7Z" fill="currentColor" />
  </Icon>
);

const ChevronLeft: FC = () => (
  <Icon size={16}>
    <path opacity="0.5" d="M14.3 11.4L18.5 7.25C18.9 6.84 18.9 6.16 18.5 5.75C18.0 5.34 17.4 5.34 16.95 5.75L11.4 11.3C11.0 11.68 11.0 12.32 11.4 12.71L16.95 18.25C17.4 18.66 18.0 18.66 18.5 18.25C18.9 17.84 18.9 17.16 18.5 16.75L14.3 12.57C13.95 12.25 13.95 11.75 14.3 11.43Z" fill="currentColor" />
    <path d="M8.27 11.4L12.45 7.25C12.86 6.84 12.86 6.16 12.45 5.75C12.04 5.34 11.36 5.34 10.95 5.75L5.41 11.3C5.02 11.68 5.02 12.32 5.41 12.71L10.95 18.25C11.36 18.66 12.04 18.66 12.45 18.25C12.86 17.84 12.86 17.16 12.45 16.75L8.27 12.57C7.95 12.25 7.95 11.75 8.27 11.43Z" fill="currentColor" />
  </Icon>
);

const MenuIcon: FC = () => (
  <Icon size={22}>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Icon>
);

const CloseIcon: FC = () => (
  <Icon size={22}>
    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Icon>
);

const BellIcon: FC = () => (
  <Icon size={20}>
    <path opacity="0.3" d="M12 2C9.24 2 7 4.24 7 7v5l-2 2v1h14v-1l-2-2V7c0-2.76-2.24-5-5-5z" fill="currentColor" />
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM7 13v-2l2-2V7c0-2.21 1.79-4 4-4s4 1.79 4 4v2l2 2v2H7z" fill="currentColor" />
  </Icon>
);

const SearchIcon: FC = () => (
  <Icon size={18}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Icon>
);

const GridIcon: FC = () => (
  <Icon size={20}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
  </Icon>
);

const UserIcon: FC = () => (
  <Icon size={20}>
    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.4" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" fill="currentColor" opacity="0.8" />
  </Icon>
);

const ChevronDown: FC = () => (
  <Icon size={14}>
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

const UpArrow: FC = () => (
  <Icon size={22}>
    <rect opacity="0.5" x="13" y="6" width="13" height="2" rx="1" transform="rotate(90 13 6)" fill="currentColor" />
    <path d="M12.57 8.57L16.75 12.75C17.16 13.16 17.84 13.16 18.25 12.75C18.66 12.34 18.66 11.66 18.25 11.25L12.71 5.71C12.32 5.32 11.68 5.32 11.29 5.71L5.75 11.25C5.34 11.66 5.34 12.34 5.75 12.75C6.16 13.16 6.84 13.16 7.25 12.75L11.43 8.57C11.75 8.25 12.25 8.25 12.57 8.57Z" fill="currentColor" />
  </Icon>
);

// ─── SCROLL TO TOP ────────────────────────────────────────────────────────────

const ScrollTop: FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const handler = () => setVisible(window.pageYOffset > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999,
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg, #3699FF, #2670cc)",
        border: "none", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(54,153,255,0.45)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
        pointerEvents: visible ? "auto" : "none",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        color: "white",
      }}
    >
      <UpArrow />
    </button>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const Footer: FC = () => {
  const year = new Date().getFullYear();

  const handleLinkEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = "#3699FF";
  };
  const handleLinkLeave = (e: MouseEvent<HTMLAnchorElement>, original: string) => {
    e.currentTarget.style.color = original;
  };

  return (
    <footer style={{
      background: "white",
      borderTop: "1px solid #f0f3f8",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}>
      <span style={{ fontSize: 13, color: "#9eaec5" }}>
        <span style={{ fontWeight: 700, color: "#b5bfd0" }}>{year}©</span>{" "}
        <a
          href="/admin"
          style={{ color: "#6b7a99", textDecoration: "none", fontWeight: 600, transition: "color .2s" }}
          onMouseEnter={handleLinkEnter}
          onMouseLeave={(e) => handleLinkLeave(e, "#6b7a99")}
        >
          Proideas
        </a>
      </span>
      {/* <div style={{ display: "flex", gap: 4 }}>
        {(["About", "Support", "Purchase"] as const).map((l) => (
          <a
            key={l}
            href="/admin"
            style={{
              padding: "4px 12px", fontSize: 13, fontWeight: 600,
              color: "#9eaec5", textDecoration: "none", borderRadius: 6,
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3699FF";
              e.currentTarget.style.background = "#f0f7ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9eaec5";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {l}
          </a>
        ))}
      </div> */}
    </footer>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

const Navbar: FC<NavbarProps> = ({ onMobileMenuToggle, isMobileOpen }) => {
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);

  const notifications: Notification[] = [
    { text: "New report generated", time: "2m ago", dot: "#3699FF" },
    { text: "User access updated", time: "1h ago", dot: "#0BB783" },
    { text: "System maintenance scheduled", time: "3h ago", dot: "#FFA800" },
  ];

  const profileLinks: [string, string][] = [
    ["Mi Perfil", "#3699FF"],
    ["Configuración", "#0BB783"],
    ["Cerrar Sesión", "#F64E60"],
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "white",
      borderBottom: "1px solid #f0f3f8",
      padding: "0 24px",
      height: 64,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    }}>
      {/* Left: mobile toggle + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
          style={{
            display: "none",
            background: "none", border: "none", cursor: "pointer",
            color: "#7e8299", padding: 4, borderRadius: 8,
          }}
          className="mobile-menu-btn"
        >
          {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Search bar */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#f5f8fa", borderRadius: 10, padding: "8px 14px",
            border: "1.5px solid transparent", transition: "all .2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3699FF")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
        >
          <span style={{ color: "#b5bfc9" }}><SearchIcon /></span>
          <input
            placeholder="Buscar..."
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 14, color: "#3f4254", width: 180,
            }}
          />
        </div>
      </div>

      {/* Right: notifications + apps + profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Apps grid */}
        <button
          aria-label="Apps"
          style={{
            background: "none", border: "none", cursor: "pointer",
            width: 38, height: 38, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#7e8299", transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f5f8fa";
            e.currentTarget.style.color = "#3699FF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#7e8299";
          }}
        >
          <GridIcon />
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            aria-label="Notifications"
            style={{
              background: notifOpen ? "#f0f7ff" : "none",
              border: "none", cursor: "pointer",
              width: 38, height: 38, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: notifOpen ? "#3699FF" : "#7e8299",
              transition: "all .2s", position: "relative",
            }}
          >
            <BellIcon />
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 8, height: 8, borderRadius: "50%",
              background: "#F64E60", border: "2px solid white",
            }} />
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 300, background: "white", borderRadius: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              border: "1px solid #f0f3f8", overflow: "hidden", zIndex: 100,
            }}>
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid #f5f8fa",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#3f4254" }}>Notificaciones</span>
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 20,
                  background: "#f0f7ff", color: "#3699FF", fontWeight: 700,
                }}>
                  {notifications.length} nuevas
                </span>
              </div>
              {notifications.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 20px", display: "flex", alignItems: "flex-start", gap: 12,
                    borderBottom: i < notifications.length - 1 ? "1px solid #f5f8fa" : "none",
                    cursor: "pointer", transition: "background .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: n.dot, marginTop: 6, flexShrink: 0,
                    display: "inline-block",
                  }} />
                  <div>
                    <div style={{ fontSize: 13, color: "#3f4254", fontWeight: 600 }}>{n.text}</div>
                    <div style={{ fontSize: 12, color: "#b5bfc9", marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#eef0f8", margin: "0 6px" }} />

        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: profileOpen ? "#f0f7ff" : "none",
              border: "none", cursor: "pointer", borderRadius: 12,
              padding: "6px 10px", transition: "all .2s",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #3699FF, #1a56cc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", flexShrink: 0,
            }}>
              <UserIcon />
            </div>
            <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }} className="hide-sm">
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3f4254", lineHeight: 1.2 }}>Admin</span>
              <span style={{ fontSize: 11, color: "#b5bfc9" }}>Administrador</span>
            </div>
            <span style={{ color: "#b5bfc9", marginLeft: 2 }} className="hide-sm">
              <ChevronDown />
            </span>
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 210, background: "white", borderRadius: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              border: "1px solid #f0f3f8", overflow: "hidden", zIndex: 100,
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f8fa" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#3f4254" }}>Admin User</div>
                <div style={{ fontSize: 12, color: "#b5bfc9", marginTop: 2 }}>admin@herramientas.com</div>
              </div>
              {profileLinks.map(([label, color]) => (
                <a
                  key={label}
                  href="/admin"
                  style={{
                    display: "block", padding: "12px 20px",
                    fontSize: 13, fontWeight: 600, color: "#5e6278",
                    textDecoration: "none", transition: "all .15s",
                    borderBottom: label !== "Cerrar Sesión" ? "1px solid #f5f8fa" : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fafbff";
                    e.currentTarget.style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#5e6278";
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const menuItems: MenuItem[] = [
  { title: "Plantillas Maestras", href: "/admin/master/plantillas" },
  { title: "Reportes Kapital", href: "/admin/kapital/reportes" },
  { title: "Reportes Valora", href: "/admin/valora/reportes" },
  { title: "Configuración", href: "/admin/configuraciones" },
];

const Sidebar: FC<SidebarProps> = ({ isMinimized, onToggleMinimize, isMobileOpen, onCloseMobile }) => {
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = (href: string): boolean => href !== "#" && currentPath.startsWith(href);

  return (
    <>
      {/* Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(30,30,45,0.55)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50,
          width: isMinimized ? 75 : 225,
          background: "#1e1e2d",
          display: "flex", flexDirection: "column",
          transition: "width .3s cubic-bezier(.4,0,.2,1), transform .3s ease",
          boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
        }}
        className={`sidebar-root${isMobileOpen ? " mobile-open" : ""}`}
      >
        {/* Logo */}
        <div style={{
          padding: "24px 16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          justifyContent: isMinimized ? "center" : "space-between",
          position: "relative",
        }}>
          <a href="/admin" style={{ textDecoration: "none" }}>
            {isMinimized ? (
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "linear-gradient(135deg, #3699FF, #1a56cc)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 900, fontSize: 14, letterSpacing: 1,
              }}>A</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #3699FF, #1a56cc)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 900, fontSize: 12,
                }}>A</div>
                <span style={{ color: "white", fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Admin
                </span>
              </div>
            )}
          </a>

          {/* Collapse button */}
          <button
            onClick={onToggleMinimize}
            aria-label="Toggle sidebar"
            className="collapse-btn"
            style={{
              position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
              width: 28, height: 28, borderRadius: "50%",
              background: "white", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              color: "#7e8299",
              transition: "box-shadow .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(54,153,255,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.18)")}
          >
            <span style={{ transform: isMinimized ? "rotate(180deg)" : "none", display: "flex", transition: "transform .3s" }}>
              <ChevronLeft />
            </span>
          </button>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 10px" }}>
          {!isMinimized && (
            <div style={{
              fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.14em", textTransform: "uppercase",
              padding: "0 8px", marginBottom: 12,
            }}>Módulos</div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  title={isMinimized ? item.title : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: isMinimized ? 0 : 12,
                    justifyContent: isMinimized ? "center" : "flex-start",
                    padding: isMinimized ? "12px" : "10px 12px",
                    borderRadius: 10, textDecoration: "none",
                    background: active ? "rgba(54,153,255,0.12)" : "transparent",
                    color: active ? "#3699FF" : "rgba(255,255,255,0.5)",
                    fontWeight: active ? 700 : 500,
                    fontSize: 13, letterSpacing: "0.01em",
                    transition: "all .2s",
                    position: "relative",
                    borderLeft: active ? "3px solid #3699FF" : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>
                    <CubeIcon size={18} />
                  </span>
                  {!isMinimized && <span>{item.title}</span>}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Bottom version tag */}
        {!isMinimized && (
          <div style={{
            margin: 10, padding: "14px 14px",
            borderRadius: 12,
            background: "rgba(54,153,255,0.1)",
            border: "1px solid rgba(54,153,255,0.15)",
          }}>
            <div style={{
              fontSize: 11, color: "rgba(255,255,255,0.35)",
              fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", marginBottom: 6,
            }}>Versión</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>v2.5.0 — Estable</div>
          </div>
        )}
      </aside>
    </>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

const statCards: StatCard[] = [
  { label: "Plantillas Activas", value: "148", delta: "+12%", color: "#3699FF" },
  { label: "Reportes Kapital", value: "34", delta: "+5%", color: "#0BB783" },
  { label: "Reportes Valora", value: "27", delta: "+8%", color: "#8950FC" },
  { label: "Configuraciones", value: "09", delta: "—", color: "#FFA800" },
];

// Pre-computed widths to avoid random values on re-render
const barWidths: string[] = ["65%", "52%", "73%", "48%"];

const DashboardPage: FC = () => (
  <div>
    {/* Toolbar */}
    <div style={{ background: "white", padding: "20px 28px", borderBottom: "1px solid #f0f3f8" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1a1d2e", letterSpacing: "-0.01em" }}>
        Dashboard
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <a href="/admin" style={{ fontSize: 13, color: "#9eaec5", textDecoration: "none", fontWeight: 600 }}>Home</a>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5e0", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#b5bfc9", fontWeight: 600 }}>Dashboards</span>
      </div>
    </div>

    {/* Content */}
    <div style={{ padding: "28px 28px 40px" }}>
      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginBottom: 28,
      }}>
        {statCards.map((s, idx) => (
          <div key={s.label} style={{
            background: "white", borderRadius: 16, padding: "22px 24px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: "1px solid #f0f3f8",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -16, right: -16,
              width: 80, height: 80, borderRadius: "50%",
              background: s.color, opacity: 0.06,
            }} />
            <div style={{
              fontSize: 12, fontWeight: 700, color: "#b5bfc9",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
            }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "#1a1d2e", lineHeight: 1 }}>{s.value}</span>
              {s.delta !== "—" && (
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#0BB783",
                  background: "rgba(11,183,131,0.1)", padding: "2px 8px", borderRadius: 20,
                }}>
                  {s.delta}
                </span>
              )}
            </div>
            <div style={{ marginTop: 14, height: 4, background: "#f5f8fa", borderRadius: 4 }}>
              <div style={{
                height: "100%", width: barWidths[idx],
                background: s.color, borderRadius: 4, opacity: 0.8,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 2px 20px rgba(0,0,0,0.06)", overflow: "hidden",
        border: "1px solid #f0f3f8",
      }}>
        <div style={{
          padding: "36px 40px 40px",
          background: "linear-gradient(135deg, #f8faff 0%, #fff 100%)",
          minHeight: 280, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", padding: "6px 16px", borderRadius: 40,
            background: "rgba(54,153,255,0.1)", marginBottom: 20,
            fontSize: 12, fontWeight: 700, color: "#3699FF", letterSpacing: "0.08em",
          }}>BIENVENIDO AL PANEL</div>
          <h2 style={{
            fontSize: 36, fontWeight: 900, color: "#1a1d2e",
            margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>
            Plataforma<br />
            <a href="/" style={{ color: "#3699FF", textDecoration: "none" }}>Herramientas</a>
          </h2>
          <p style={{ color: "#9eaec5", fontSize: 15, marginTop: 16, maxWidth: 420, lineHeight: 1.6 }}>
            Gestiona tus plantillas, reportes y configuraciones desde un solo lugar.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [minimized, setMinimized] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const sidebarWidth = minimized ? 75 : 225;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#e9edf1" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Manrope', sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

        .sidebar-root { transform: translateX(0); }

        @media (max-width: 1023px) {
          .sidebar-root { transform: translateX(-100%); }
          .sidebar-root.mobile-open { transform: translateX(0) !important; }
          .collapse-btn { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
          .hide-sm { display: none !important; }
        }
      `}</style>

      <Sidebar
        isMinimized={minimized}
        onToggleMinimize={() => setMinimized(!minimized)}
        isMobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarWidth,
          flex: 1, display: "flex", flexDirection: "column",
          transition: "margin-left .3s cubic-bezier(.4,0,.2,1)",
          minWidth: 0,
        }}
      >
        <Navbar
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          isMobileOpen={mobileOpen}
        />

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <Footer />
        <ScrollTop />
      </div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  );
}

export { MainLayout, Sidebar, Navbar, Footer, ScrollTop, DashboardPage };
export type { MainLayoutProps, SidebarProps, NavbarProps, MenuItem, StatCard, Notification };