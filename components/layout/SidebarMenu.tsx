"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ICONS } from "@/lib/icons";
import { useAuthStore } from "@/store/useAuthStore";

type SidebarMenuProps = {
  collapsed?: boolean;
  isAccountSetup?: boolean;
  customMenuIcons?: Record<string, string>;
  focusArticleSubnav?: boolean;
  onToggle?: () => void;
  showMenuToggle?: boolean;
};

type MenuRowConfig = {
  label: string;
  icon: string;
  iconSrc?: string;
  to?: string;
  muted?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  compact?: boolean;
  iconClassName?: string;
  hideChevron?: boolean;
};

export default function SidebarMenu({
  collapsed = false,
  isAccountSetup = false,
  customMenuIcons = {},
  focusArticleSubnav = false,
  onToggle,
  showMenuToggle = true,
}: SidebarMenuProps) {
  const pathname = usePathname();
  const safePathname = pathname ?? "";
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoggedIn = !!user;

  const [akunExpanded, setAkunExpanded] = useState(false);
  const [sumbangsihExpanded, setSumbangsihExpanded] = useState(false);

  const useExpandedArticleDesktopMenuTone = focusArticleSubnav && !collapsed;

  const isActive = (path: string) => safePathname === path;
  const isAnyChildActive = (paths: string[]) =>
    paths.some((path) => safePathname === path);

  const akunChildPaths = ["/complete-profile", "/buat-akun", "/settings"];
  const sumbangsihChildPaths = ["/kronik", "/tilik", "/diskursus", "/tanggapan"];
  const isAkunActive = isAnyChildActive(akunChildPaths);
  const isSumbangsihActive = isAnyChildActive(sumbangsihChildPaths);

  const resolvedAkunExpanded = isAkunActive || akunExpanded;
  const resolvedSumbangsihExpanded = isSumbangsihActive || sumbangsihExpanded;

  const renderDefaultMenuRow = ({
    label,
    icon,
    iconSrc = "",
    to,
    muted = false,
    expandable = false,
    expanded = false,
    onClick,
    disabled = false,
    compact = false,
    iconClassName = "",
    hideChevron = false,
  }: MenuRowConfig) => {
    const sharedClassName = [
      !focusArticleSubnav ? "sidebar-nav-default__item " : "sidebar-nav-default__item-toc",
      muted ? "sidebar-nav-default__item--muted" : "",
      compact ? "sidebar-nav-default__item--compact" : "",
      isAccountSetup ? "sidebar-nav-default__item--account-setup" : "",
      collapsed ? "sidebar-nav-default__item--collapsed" : "",
      disabled ? "sidebar-nav-default__item--disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {iconSrc ? (
          <span className={`sidebar-nav-default__icon ${iconClassName}`.trim()} aria-hidden="true">
            <Image
              src={iconSrc}
              alt=""
              width={16}
              height={16}
              className="h-[16px] w-[16px] object-contain"
              unoptimized
            />
          </span>
        ) : (
          <span className={`sidebar-nav-default__icon ${iconClassName}`.trim()} dangerouslySetInnerHTML={{ __html: icon }} />
        )}
        {!collapsed && <span className="sidebar-nav-default__label">{label}</span>}
        {expandable && !collapsed && !hideChevron && (
          <span className="sidebar-nav-default__chevron" aria-hidden="true">
            {expanded ? "⌄" : "›"}
          </span>
        )}
      </>
    );

    if (to && !disabled) {
      return (
        <Link href={to} className={sharedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <button type="button" className={sharedClassName} onClick={disabled ? undefined : onClick} disabled={disabled}>
        {content}
      </button>
    );
  };

  return (
    <>
      <nav className={`sidebar-nav-default__menu`}>
        {isLoggedIn ? (
          <>
            {renderDefaultMenuRow({
              label: "Akunku",
              icon: ICONS.user,
              iconSrc: customMenuIcons.akunku,
              expandable: true,
              expanded: resolvedAkunExpanded,
              onClick: () => setAkunExpanded((prev) => !prev),
              muted: useExpandedArticleDesktopMenuTone ? false : !isAkunActive,
              hideChevron: isAccountSetup,
            })}

            {resolvedAkunExpanded && (
              <div className={`${isAccountSetup ? "sidebar-nav-default__submenu--account-setup" : "sidebar-nav-default__submenu"}`}>
                {isAccountSetup && <div className="w-full h-0 border-[0.5px] border-t border-[#e2e1bc] my-2" />}
                <Link
                  href={isActive("/buat-akun") ? "/buat-akun" : "/complete-profile"}
                  className={`sidebar-nav-default__subitem ${isActive("/complete-profile") || isActive("/buat-akun") ? "sidebar-nav-default__subitem--active" : ""} ${isAccountSetup ? "sidebar-nav-default__subitem--account-setup" : ""}`}
                >
                  {isAccountSetup && customMenuIcons.biodata ? (
                    <Image
                      src={customMenuIcons.biodata}
                      alt=""
                      width={14}
                      height={14}
                      className="h-[14px]! w-[14px]! shrink-0 object-contain"
                      unoptimized
                    />
                  ) : null}
                  Biodata
                </Link>
                {isAccountSetup && <div className="w-full h-0 border-[0.5px] border-t border-[#e2e1bc] my-2" />}
                <Link
                  href="/settings"
                  className={`sidebar-nav-default__subitem ${isActive("/settings") ? "sidebar-nav-default__subitem--active" : ""} ${isAccountSetup ? "sidebar-nav-default__subitem--account-setup" : ""}`}
                >
                  {isAccountSetup && customMenuIcons.pengaturan ? (
                    <Image
                      src={customMenuIcons.pengaturan}
                      alt=""
                      width={14}
                      height={14}
                      className="h-[14px]! w-[14px]! shrink-0 object-contain"
                      unoptimized
                    />
                  ) : null}
                  Pengaturan & Privasi
                </Link>
                {isAccountSetup && <div className="w-full h-0 border-[0.5px] border-t border-[#e2e1bc] my-2" />}
              </div>
            )}

            {renderDefaultMenuRow({
              label: "Sumbangsih",
              icon: ICONS.edit,
              expandable: true,
              expanded: resolvedSumbangsihExpanded,
              onClick: () => setSumbangsihExpanded((prev) => !prev),
              muted: useExpandedArticleDesktopMenuTone ? false : !isSumbangsihActive,
              hideChevron: isAccountSetup,
            })}

            {resolvedSumbangsihExpanded && (
              <div className="sidebar-nav-default__submenu">
                <Link href="/kronik" className={`sidebar-nav-default__subitem ${isActive("/kronik") ? "sidebar-nav-default__subitem--active" : ""}`}>Kronik</Link>
                <Link href="/tilik" className={`sidebar-nav-default__subitem ${isActive("/tilik") ? "sidebar-nav-default__subitem--active" : ""}`}>Tilik</Link>
                <Link href="/diskursus" className={`sidebar-nav-default__subitem ${isActive("/diskursus") ? "sidebar-nav-default__subitem--active" : ""}`}>Diskursus</Link>
                <Link href="/tanggapan" className={`sidebar-nav-default__subitem ${isActive("/tanggapan") ? "sidebar-nav-default__subitem--active" : ""}`}>Tanggapan</Link>
              </div>
            )}
          </>
        ) : (
          <>
            {renderDefaultMenuRow({ label: "Akunku", icon: ICONS.user, expandable: true, muted: true, disabled: true })}
            {renderDefaultMenuRow({ label: "Sumbangsih", icon: ICONS.edit, expandable: true, muted: true, disabled: true })}
          </>
        )}

        {renderDefaultMenuRow({
          label: "Tentang Telisik",
          icon: ICONS.info,
          to: "/tentang-telisik",
          muted: useExpandedArticleDesktopMenuTone ? false : !isActive("/tentang-telisik"),
          hideChevron: isAccountSetup,
        })}
        {renderDefaultMenuRow({
          label: "Bantuan & Dukungan",
          icon: ICONS.help,
          to: "/bantuan",
          muted: useExpandedArticleDesktopMenuTone ? false : !isActive("/bantuan"),
          hideChevron: isAccountSetup,
        })}
      </nav>

      {!collapsed && isLoggedIn && focusArticleSubnav && <div className="sidebar-nav-default__divider-toc" />}
      {!collapsed && !focusArticleSubnav && <div className="sidebar-nav-default__divider sidebar-nav-default__divider--spaced" />}

      {isLoggedIn ? (
        <div className="sidebar-nav-default__footer">
          {renderDefaultMenuRow({
            label: "Keluar Log",
            icon: ICONS.logout,
            onClick: logout,
            muted: !useExpandedArticleDesktopMenuTone,
            compact: true,
            iconClassName: "sidebar-nav-default__icon--logout",
          })}
          {showMenuToggle && renderDefaultMenuRow({
            label: collapsed ? "Buka Menu" : "Tutup Menu",
            icon: collapsed ? ICONS.bukamenu : ICONS.tutupmenu,
            onClick: onToggle,
            muted: !useExpandedArticleDesktopMenuTone,
            compact: true,
            disabled: !onToggle,
          })}
        </div>
      ) : (
        <div className="sidebar-nav-default__footer">
          {renderDefaultMenuRow({ label: "Keluar Log", icon: ICONS.logout, muted: true, compact: true, disabled: true, iconClassName: "sidebar-nav-default__icon--logout" })}
          {showMenuToggle && renderDefaultMenuRow({ label: collapsed ? "Buka Menu" : "Tutup Menu", icon: collapsed ? ICONS.bukamenu : ICONS.tutupmenu, onClick: onToggle, muted: true, compact: true, disabled: !onToggle })}
        </div>
      )}
    </>
  );
}