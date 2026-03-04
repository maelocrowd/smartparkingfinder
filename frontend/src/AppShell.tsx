import { Link } from "react-router-dom";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export const AppShell: React.FC<Props> = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Smart Corridor Parking Finder</div>
        <nav className="nav-links">
          <Link to="/">Map</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>© 2026</span>
        <span>Powered by{" "}
          <a
            href="https://sites.google.com/view/geonexus/home"
            target="_blank"
            rel="noreferrer"
          >
            GeoNexus
          </a>
        </span>
      </footer>
    </div>
  );
};

