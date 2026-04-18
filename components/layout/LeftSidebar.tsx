"use client";

import React, { useRef } from "react";
import { usePathname } from "next/navigation";

import SidebarProfile from "./SidebarProfile";
import SidebarArticleTOC from "./SidebarArticleTOC";
import SidebarMenu from "./SidebarMenu";
import SidebarBanner from "./SidebarBanner";
import SidebarFeed from "./SidebarFeed";

interface LeftSidebarProps {
  articleTOC?: [];
  collapsed?: boolean;
  onToggle?: () => void;
  mode?: string;
  variant?: string;
  showFeed?: boolean;
  showMenuToggle?: boolean;
  showBanner?: boolean;
  avatarPreview?: string;
  avatarLabel?: string;
  onAvatarClick?: () => void;
  customMenuIcons?: Record<string, string>;
}

export default function LeftSidebar({
  articleTOC = [],
  collapsed = false,
  onToggle,
  mode = "default",
  variant = "default",
  showFeed = true,
  showMenuToggle = true,
  showBanner = true,
  avatarPreview = "",
  avatarLabel = "Foto profil",
  onAvatarClick,
  customMenuIcons = {},
}: LeftSidebarProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Logic penentu halaman
  const isFeatureArticleListPage = /^\/article\/(kronik|tilik)\/?$/.test(pathname || "");
  const focusArticleSubnav = mode === "article" && articleTOC.length > 0;
  const isAccountSetup = variant === "account_setup";

  return (
    <div
      ref={shellRef}
      className={`sidebar-nav-shell ${
        collapsed ? "sidebar-nav-shell--collapsed " : ""
      }${
        focusArticleSubnav
          ? "sidebar-nav-shell--article"
          : "sidebar-nav-shell--default"
      }${
        isAccountSetup ? " sidebar-nav-shell--account-setup w-64! px-6!" : ""
      } hidden min-h-full w-full bg-transparent md:flex md:flex-col
        ${focusArticleSubnav ? "p-0! pt-4!" : "px-3! pb-4! pt-4!"}
      `}
    >
      <SidebarProfile 
        collapsed={collapsed} 
        isAccountSetup={isAccountSetup}
        avatarPreview={avatarPreview}
        avatarLabel={avatarLabel}
        onAvatarClick={onAvatarClick}
        focusArticleSubnav={focusArticleSubnav}
        isFeatureArticleListPage={isFeatureArticleListPage}
      />

      <SidebarArticleTOC 
        articleTOC={articleTOC}
        collapsed={collapsed}
        showTOC={focusArticleSubnav}
      />

      {focusArticleSubnav && <div className="pb-2" />}
      {!focusArticleSubnav && <div className="mt-2" />}
      {!focusArticleSubnav && isFeatureArticleListPage && !collapsed && (
        <div className="sidebar-nav-default__divider" />
      )}
      {!focusArticleSubnav && !isFeatureArticleListPage && !collapsed && (
        <div className="sidebar-nav-default__divider" />
      )}

      <SidebarMenu 
        collapsed={collapsed}
        isAccountSetup={isAccountSetup}
        customMenuIcons={customMenuIcons}
        focusArticleSubnav={focusArticleSubnav}
        onToggle={onToggle}
        showMenuToggle={showMenuToggle}
      />

      <SidebarBanner 
        showBanner={showBanner}
        focusArticleSubnav={focusArticleSubnav}
        collapsed={collapsed}
      />

      <SidebarFeed 
        showFeed={showFeed}
        focusArticleSubnav={focusArticleSubnav}
        collapsed={collapsed}
      />
    </div>
  );
}