"use client";

import React, { useEffect, useState } from "react";
import { parseJsonResponse, resolveApiBase, resolveApiUrl } from "@/lib/api";

type SidebarBannerItem = {
  position?: string;
  expires_at?: string;
  image?: string;
  url?: string;
  title?: string;
};

type SidebarBannerProps = {
  showBanner?: boolean;
  focusArticleSubnav?: boolean;
  collapsed?: boolean;
};

export default function SidebarBanner({
  showBanner = true,
  focusArticleSubnav = false,
  collapsed = false,
}: SidebarBannerProps) {
  const [banners, setBanners] = useState<SidebarBannerItem[]>([]);
  const mediaBase = resolveApiBase() || "https://api.telisik.org";

  useEffect(() => {
    if (!showBanner || focusArticleSubnav) return;
    
    let ignore = false;

    const fetchSidebarData = async () => {
      try {
        const response = await fetch(resolveApiUrl("/api/banners/"));
        if (!response.ok) return;
        const data = await parseJsonResponse<{ banners?: SidebarBannerItem[] }>(
          response,
        );
        if (!ignore) {
          setBanners(Array.isArray(data.banners) ? data.banners : []);
        }
      } catch {
        if (!ignore) {
          setBanners([]);
        }
      }
    };

    fetchSidebarData();

    return () => {
      ignore = true;
    };
  }, [showBanner, focusArticleSubnav]);

  const getBannerByPosition = (position: string) => {
    if (!banners.length) return null;
    const valid = banners.filter((banner) => {
      if (banner.position !== position) return false;
      if (!banner.expires_at) return true;
      return new Date(banner.expires_at) > new Date();
    });
    return valid.length > 0
      ? valid[Math.floor(Math.random() * valid.length)]
      : null;
  };

  const bannerLeft = getBannerByPosition("sidebar_top");

  const resolveBannerImage = (banner: SidebarBannerItem | null) => {
    if (!banner) return "";
    const rawImage = typeof banner.image === "string" ? banner.image.trim() : "";
    const rawUrl = typeof banner.url === "string" ? banner.url.trim() : "";
    const imagePath = rawImage || (rawUrl.startsWith("/static/") || rawUrl.startsWith("static/") ? rawUrl : "");

    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return imagePath.startsWith("/") ? `${mediaBase}${imagePath}` : `${mediaBase}/${imagePath}`;
  };

  const getBannerHref = (banner: SidebarBannerItem | null) => {
    if (!banner || typeof banner.url !== "string") return "";
    const rawUrl = banner.url.trim();
    if (!rawUrl || rawUrl.startsWith("/static/") || rawUrl.startsWith("static/")) return "";
    return rawUrl;
  };

  const bannerLeftImage = resolveBannerImage(bannerLeft);
  const bannerLeftHref = getBannerHref(bannerLeft);

  const hideBrokenImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
  };

  if (focusArticleSubnav || !showBanner || !bannerLeft || !bannerLeftImage || collapsed) {
    return null;
  }

  return (
    <div className="mb-3 mt-3 w-full">
      {bannerLeftHref ? (
        <a href={bannerLeftHref} target="_blank" rel="noopener noreferrer" className="block w-full">
          <div className="relative w-full" style={{ paddingTop: "100%" }}>
            <img src={bannerLeftImage} alt={bannerLeft.title} className="absolute inset-0 w-full h-full rounded-sm border border-[#dedacb] shadow-sm object-cover" onError={hideBrokenImage} />
          </div>
        </a>
      ) : (
        <div className="relative w-full" style={{ paddingTop: "100%" }}>
          <img src={bannerLeftImage} alt={bannerLeft.title} className="absolute inset-0 w-full h-full rounded-sm border border-[#dedacb] shadow-sm object-cover" onError={hideBrokenImage} />
        </div>
      )}
    </div>
  );
}