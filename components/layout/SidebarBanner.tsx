"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "../config";

export default function SidebarBanner({ showBanner, focusArticleSubnav, collapsed }) {
  const [banners, setBanners] = useState();
  const mediaBase = API_BASE || "https://api.telisik.org";

  useEffect(() => {
    if (!showBanner || focusArticleSubnav) return;
    
    const fetchSidebarData = async () => {
      try {
        const bannersRes = await fetch(`${API_BASE}/api/banners/`);
        if (!bannersRes.ok) throw new Error("Failed to fetch sidebar data");
        const bannersData = await bannersRes.json();
        setBanners(bannersData.banners || []);
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    };

    fetchSidebarData();
  }, [showBanner, focusArticleSubnav]);

  const getBannerByPosition = (position) => {
    if (banners) {
      const valid = banners.filter((b) => b.position === position && new Date(b.expires_at) > new Date());
      return valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : null;
    }
  };

  const bannerLeft = getBannerByPosition("sidebar_top");

  const resolveBannerImage = (banner) => {
    if (!banner) return "";
    const rawImage = typeof banner.image === "string" ? banner.image.trim() : "";
    const rawUrl = typeof banner.url === "string" ? banner.url.trim() : "";
    const imagePath = rawImage || (rawUrl.startsWith("/static/") || rawUrl.startsWith("static/") ? rawUrl : "");

    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return imagePath.startsWith("/") ? `${mediaBase}${imagePath}` : `${mediaBase}/${imagePath}`;
  };

  const getBannerHref = (banner) => {
    if (!banner || typeof banner.url !== "string") return "";
    const rawUrl = banner.url.trim();
    if (!rawUrl || rawUrl.startsWith("/static/") || rawUrl.startsWith("static/")) return "";
    return rawUrl;
  };

  const bannerLeftImage = resolveBannerImage(bannerLeft);
  const bannerLeftHref = getBannerHref(bannerLeft);

  const hideBrokenImage = (event) => {
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