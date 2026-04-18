"use client";

import React from "react";
import { useAuth } from "../AuthContext";

export default function SidebarArticleTOC({ articleTOC, collapsed, showTOC }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  if (!showTOC) return null;

  const scrollArticleTarget = (targetId) => {
    const target = document.getElementById(targetId);
    const middleCol = document.getElementById("middle-col-scroll");

    if (target && middleCol) {
      middleCol.scrollTo({
        top: target.offsetTop - 40,
        behavior: "smooth",
      });
    }
  };

  const renderArticleTOCIcon = (type = "section") => {
    if (type === "footnotes") {
      return (
        <span className="sidebar-nav-article__glyph sidebar-nav-article__glyph--footnotes">
          f<sup>2</sup>
        </span>
      );
    }
    if (type === "history") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14.9296 20.8748C14.3682 21.0595 13.781 21.1933 13.1727 21.2702C8.05307 21.9178 3.37784 18.2925 2.73027 13.1728C2.26877 9.52428 3.97741 6.10143 6.85048 4.20124" stroke="currentColor" strokeLinecap="round" />
          <path d="M3.02832 3.96777L7.0283 3.98191L7.01416 7.98188" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.08105 3.12402C13.9832 1.51199 19.264 4.17917 20.876 9.08134C22.2153 13.1541 20.6009 17.4881 17.2052 19.7626" stroke="currentColor" strokeLinecap="round" strokeDasharray="2 2" />
          <path d="M7.61637 16.5177L11.4639 15.5844C11.6117 15.5485 11.7469 15.4729 11.8548 15.3657L17.0453 10.2078C17.5361 9.72009 17.5373 8.92648 17.0481 8.43724L15.7068 7.09596C15.2182 6.60737 14.4258 6.60788 13.9379 7.0971L8.76927 12.2789C8.66146 12.387 8.58541 12.5226 8.54942 12.671L7.61637 16.5177Z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    }
    if (type === "comments") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M21.0625 12C21.0625 17.0051 17.0051 21.0625 12 21.0625C10.218 21.0625 8.55605 20.5481 7.15463 19.6598L2.9375 21.0625L4.58125 17.2062C3.54555 15.7331 2.9375 13.9376 2.9375 12C2.9375 6.99492 6.99492 2.9375 12 2.9375C17.0051 2.9375 21.0625 6.99492 21.0625 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="10.9287" cy="12" r="1.25" fill="currentColor" />
          <circle cx="16.0625" cy="12" r="1.25" fill="currentColor" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M11.2729 14.7466C12.763 15.5524 15.533 15.0539 15.533 12.5693C15.533 10.7356 13.9523 9.81612 12.0504 8.91521C10.1484 8.01431 9.00293 7.15273 9.00293 5.49735C9.00293 3.84196 10.3449 2.5 12.0003 2.5C13.263 2.5 14.3434 3.28088 14.7849 4.38609" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M12.7276 9.25344C11.2375 8.44756 8.46746 8.94611 8.46746 11.4307C8.46746 13.2644 10.0482 14.1839 11.9501 15.0848C13.852 15.9857 14.9976 16.8473 14.9976 18.5027C14.9976 20.158 13.6556 21.5 12.0002 21.5C10.7374 21.5 9.65707 20.7191 9.21562 19.6139" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  };

  const articleNavigationItems = [
    ...articleTOC.map((item) => ({
      id: item.id,
      label: item.title,
      targetId: `section-${item.key}`,
      iconType: "section",
    })),
    {
      id: "catatankaki",
      label: "Catatan Kaki",
      targetId: "catatankaki",
      iconType: "footnotes",
    },
    {
      id: "riwayatsuntingan",
      label: "Riwayat Penyuntingan",
      targetId: "riwayatsuntingan",
      iconType: "history",
    },
    {
      id: "tanggapan",
      label: "Tanggapan",
      targetId: "tanggapan",
      iconType: "comments",
      badge: isLoggedIn ? "99+" : "",
    },
  ];

  return (
    <nav className="sidebar-nav-article__toc">
      <ul className="sidebar-nav-article__toc-list">
        {articleNavigationItems.map((item) => (
          <li key={item.id} className="sidebar-nav-article__toc-item">
            <button
              type="button"
              className={`sidebar-nav-article__toc-btn ${
                collapsed ? "sidebar-nav-article__toc-btn--collapsed" : ""
              }`}
              onClick={() => scrollArticleTarget(item.targetId)}
              aria-label={item.label}
            >
              <span className="sidebar-nav-article__toc-icon">
                {renderArticleTOCIcon(item.iconType)}
              </span>
              {!collapsed && (
                <>
                  <span className="sidebar-nav-article__toc-label">{item.label}</span>
                  {item.badge ? (
                    <span className="sidebar-nav-article__toc-badge">{item.badge}</span>
                  ) : null}
                </>
              )}
            </button>
            <div className="sidebar-nav-default__divider-toc" />
          </li>
        ))}
      </ul>
    </nav>
  );
}