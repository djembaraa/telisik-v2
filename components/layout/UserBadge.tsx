"use client";

import React from "react";
import { ICONS } from "@/lib/icons";

export type UserBadgeProps = {
  name?: string;
  avatar?: string;
  time?: string;
  size?: number;
  nameSize?: number | string;
  timeSize?: number | string;
  nameColor?: string;
  singleLine?: boolean;
  className?: string;
  layout?: "inline" | "stack";
  subtitle?: string;
  subtitleSize?: number | string;
  subtitleColor?: string;
  username?: string;
  usernameSize?: number | string;
  usernameColor?: string;
  align?: "center" | "left";
  hideText?: boolean;
  isTOCItem?: boolean;
  isCollapsed?: boolean;
};

const DOT = "\u00b7";

export default function UserBadge({
  name = "Display Name",
  avatar = "",
  time = "",
  size = 24,
  nameSize = "0.78rem",
  timeSize = "0.65rem",
  nameColor = "#1f2937",
  singleLine = false,
  className = "",
  layout = "inline",
  subtitle = "",
  subtitleSize = "0.75rem",
  subtitleColor = "#6b6b6b",
  username = "",
  usernameSize = "0.75rem",
  usernameColor = "#6b6b6b",
  align = "center",
  hideText = false,
}: UserBadgeProps) {
  const avatarStyle: React.CSSProperties = avatar
    ? {
        backgroundImage: `url(${avatar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "transparent",
      }
    : { backgroundColor: "#e9ecef" };

  if (layout === "stack") {
    const isLeftAligned = align === "left";
    return (
      <div
        className={`${isLeftAligned ? "text-left" : "text-center"} ${className}`.trim()}
      >
        <div
          className={`rounded-full overflow-hidden ${isLeftAligned ? "" : "mx-auto"}`.trim()}
          style={{ width: size, height: size, ...avatarStyle }}
        >
          {!avatar ? (
            <div
              className="user-badge-fallback-icon"
              style={{
                width: size,
                height: size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              dangerouslySetInnerHTML={{ __html: ICONS.user }}
            />
          ) : null}
        </div>
        {!hideText ? (
          <>
            <div
              className="mt-2 font-semibold"
              style={{ fontSize: nameSize, color: nameColor }}
            >
              {name}
            </div>
            {subtitle ? (
              <div style={{ fontSize: subtitleSize, color: subtitleColor }}>
                {subtitle}
              </div>
            ) : time ? (
              <div style={{ fontSize: timeSize, color: "#9ca3af" }}>
                {DOT} {time}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex items-start ${className}`.trim()}>
      <div
        className="rounded-full mr-2 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, ...avatarStyle }}
      >
        {!avatar ? (
          <div
            className="user-badge-fallback-icon"
            style={{
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={{ __html: ICONS.user }}
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span
            className="font-semibold min-w-0"
            style={{
              fontSize: nameSize,
              color: nameColor,
              display: "inline-block",
              whiteSpace: singleLine ? "nowrap" : "normal",
            }}
          >
            {name}
          </span>

          {username ? (
            <span
              className="min-w-0 break-words"
              style={{
                fontSize: usernameSize,
                color: usernameColor,
              }}
            >
              @{username}
            </span>
          ) : null}

          {time ? (
            <span className="text-gray-400" style={{ fontSize: timeSize }}>
              {DOT} {time}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
