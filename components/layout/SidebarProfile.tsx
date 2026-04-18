"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Menggantikan useNavigate
import { API_BASE } from "@/lib/config";
import { useAuthStore } from "@/store/useAuthStore";
import ProfilePhotoModal from "./ProfilePhotoModal";
import UserBadge from "./UserBadge";

type SidebarProfileProps = {
  collapsed: boolean;
  isAccountSetup?: boolean;
  avatarPreview?: string;
  avatarLabel?: string;
  onAvatarClick?: () => void;
  focusArticleSubnav?: boolean;
  isFeatureArticleListPage?: boolean;
};

export default function SidebarProfile({
  collapsed,
  isAccountSetup,
  avatarPreview,
  avatarLabel,
  onAvatarClick,
  focusArticleSubnav,
  isFeatureArticleListPage,
}: SidebarProfileProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [guestAuthSticky, setGuestAuthSticky] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = !!user;
  const mediaBase = API_BASE || "https://api.telisik.org";

  const resolvedUserAvatar =
    typeof user?.avatar === "string" && user.avatar
      ? user.avatar.startsWith("/static/")
        ? `${mediaBase}${user.avatar}`
        : user.avatar.startsWith("static/")
        ? `${mediaBase}/${user.avatar}`
        : user.avatar
      : "";
  const avatarSrc = avatarPreview || user?.avatar || "";

  useEffect(() => {
    if (isLoggedIn) return;

    const node = profileRef.current;
    if (!node || typeof window === "undefined") return;

    const findScrollParent = (currentNode: HTMLElement | null): HTMLElement | Window => {
      let current = currentNode?.parentElement ?? null;
      while (current) {
        const styles = window.getComputedStyle(current);
        const overflowY = styles.overflowY;
        if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    };

    const scrollParent = findScrollParent(node);

    const getScrollTop = () => {
      if ("scrollTop" in scrollParent) {
        return scrollParent.scrollTop;
      }
      return window.scrollY || document.documentElement.scrollTop || 0;
    };

    const handleScroll = () => {
      const scrollTop = getScrollTop();

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      setGuestAuthSticky(isDesktop && scrollTop > 4);
    };

    handleScroll();
    if (scrollParent && scrollParent !== window) {
      scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (scrollParent && scrollParent !== window) {
        scrollParent.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isLoggedIn]);

  return (
    <div ref={profileRef}>
      {isLoggedIn ? (
        <div className={`mb-1 text-left ${collapsed ? "flex w-full justify-center" : ""}`}>
          {isAccountSetup ? (
            <button
              type="button"
              onClick={onAvatarClick || (() => setShowPhotoModal(true))}
              className="mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full! border border-[#dcec80] bg-[#efffb7] text-[#a0a176] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-all duration-300 hover:brightness-[0.99]"
            >
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={avatarLabel || "Avatar"}
                  width={112}
                  height={112}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-[3px] text-[#989574]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="m7 10 5-5 5 5" />
                    <path d="M12 15V5" />
                  </svg>
                  <span className="text-[13px] leading-4">{avatarLabel}</span>
                </div>
              )}
            </button>
          ) : (
            <button
              type="button"
              className={`w-full cursor-pointer border-0 bg-transparent p-0 ${
                collapsed ? "flex justify-center" : focusArticleSubnav || isFeatureArticleListPage ? "text-left" : "text-center"
              }`}
              onClick={() => setShowPhotoModal(true)}
              aria-label="Lihat foto profil"
            >
              <UserBadge
                layout="stack"
                align={!collapsed && (focusArticleSubnav || isFeatureArticleListPage || isLoggedIn) ? "left" : "center"}
                isTOCItem={focusArticleSubnav}
                name={user.display_name || "Display Name"}
                avatar={resolvedUserAvatar}
                size={40}
                nameSize="0.95rem"
                subtitle={`@${user.username || "username"}`}
                subtitleSize="0.8rem"
                hideText={collapsed}
                className={!collapsed && focusArticleSubnav ? "pl-3 mb-2" : `${!collapsed && isLoggedIn ? "pl-6" : "pl-0"}`}
                isCollapsed={collapsed}
              />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`sidebar-nav-default__auth cursor-pointer text-left ${guestAuthSticky ? "sidebar-nav-default__auth--sticky" : ""}`}
          onClick={() => router.push("/login")}
        >
          <Image
            src="/login.svg"
            alt="Login"
            width={24}
            height={24}
            className="sidebar-nav-default__auth-icon"
            style={{ transition: "all 0.3s ease" }}
          />
          {!collapsed && (
            <div className="sidebar-nav-default__auth-copy">
              <div className="sidebar-nav-default__auth-title">Sila Masuk/Mendaftar</div>
              <div className="sidebar-nav-default__auth-subtitle">Sumbangsihmu ditunggu</div>
            </div>
          )}
        </div>
      )}

      {showPhotoModal && (
        <ProfilePhotoModal onClose={() => setShowPhotoModal(false)} />
      )}
    </div>
  );
}