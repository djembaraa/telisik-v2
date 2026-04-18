"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE } from "../config";
import UserBadge from "./UserBadge";

// Helper functions dipindah ke luar agar tidak render ulang berulang kali
const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length > maxLength) return text.substring(0, maxLength) + "...";
  return text;
};

const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60, second: 1 };
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const counter = Math.floor(seconds / secondsInUnit);
    if (counter >= 1) {
      if (unit === "second" && counter < 10) return "just now";
      const unitLabel = counter === 1 ? unit : unit + "s";
      return `${counter} ${unitLabel} ago`;
    }
  }
  return "just now";
};

export default function SidebarFeed({ showFeed, focusArticleSubnav, collapsed }) {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const mediaBase = API_BASE || "https://api.telisik.org";

  const fetchFeedItems = async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetch(`${API_BASE}/api/latest-comments/?page=${page}&limit=10`);
      const data = await response.json();
      if (append) {
        setFeedItems((prev) => [...prev, ...(data.results || [])]);
      } else {
        setFeedItems(data.results || []);
      }
      setHasMore(data.has_next || false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch feed items:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!showFeed || focusArticleSubnav) return;
    fetchFeedItems(1);
  }, [showFeed, focusArticleSubnav]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeedItems(currentPage + 1, true);
    }
  };

  const getArticleUrl = (item) => {
    if (item.object_type === "diskursus") return `/diskursus/${item.article_slug}`;
    return `/article/${item.article_type}/${item.article_slug}`;
  };

  if (focusArticleSubnav || collapsed || !showFeed) return null;

  return (
    <div className="feed-section mt-4 mb-4 w-full text-left" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <h2 className="font-bold" style={{ fontSize: "1.5rem", color: "#f97316", textAlign: "left", marginBottom: "10px", marginTop: "30px" }}>
        (Feed Tanggapan)
      </h2>
      <hr style={{ width: "100%", border: "none", borderTop: "1px solid #6b7280", margin: "8px 0 16px 0" }} />
      
      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" role="status" aria-hidden="true"></div>
          <span className="sr-only">Loading...</span>
        </div>
      ) : feedItems.length > 0 ? (
        <>
          {feedItems.map((item, index) => (
            <div key={`${item.article_id}-${item.paragraph_id}-${index}`} className="mb-3 border-b border-[#d9d6c7] pb-3">
              <div className="mb-0.5" style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "4px" }}>
                Merespons{" "}
                <Link href={getArticleUrl(item)} className="no-underline text-[#0088FF]" style={{ color: "#0088FF" }}>
                  {truncateText(item.paragraph_id, 40) || "#000000-000"}
                </Link>
              </div>

              <div className="mb-1">
                <UserBadge
                  name={item.created_by?.display_name || "Display Name"}
                  avatar={item.created_by?.avatar ? (item.created_by.avatar.startsWith("/static/") ? `${mediaBase}${item.created_by.avatar}` : item.created_by.avatar) : ""}
                  time={timeAgo(item.created_at) || "0m"}
                  size={20}
                  nameSize="0.90rem"
                  timeSize="0.60rem"
                  nameColor="#4b5563"
                />
              </div>
              <div>
                <h6 className="mb-1 font-bold" style={{ fontSize: "1.1rem", lineHeight: "1.3" }}>
                  <Link href={getArticleUrl(item)} className="no-underline" style={{ color: "#f97316" }}>
                    {truncateText(item.article_title, 60) || "Heading (Opsional)"}
                  </Link>
                </h6>
              </div>
              <div>
                <p className="mb-1 " style={{ fontSize: "1.05rem", lineHeight: "1.5", color: "#4b5563" }}>
                  {truncateText(item.comment, 150) || "Feed default ipsum dolor sit amet"}
                </p>
              </div>

              {item.images && item.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {item.images.map((thumb) => (
                    <div
                      key={thumb.id}
                      className="rounded-sm overflow-hidden flex-1"
                      style={{
                        aspectRatio: "1",
                        backgroundImage: thumb && thumb.url ? `url(${thumb.url.startsWith("/static/") ? `${mediaBase}${thumb.url}` : thumb.url})` : "none",
                        backgroundColor: "#e9ecef",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ))}
                </div>
              )}

              {item.image && (
                <div className="mb-2">
                  <img src={item.image} alt="preview" className="w-full rounded-sm" style={{ maxHeight: "160px", objectFit: "cover", width: "100%" }} />
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pb-1">
                <div className="flex gap-4 items-center" style={{ fontSize: "1.05rem", color: "#6b7280" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M14.3438 7.99988C14.3438 11.5034 11.5035 14.3436 7.99997 14.3436C6.75253 14.3436 5.58919 13.9836 4.6082 13.3617L1.65619 14.3436L2.80682 11.6442C2.08183 10.6131 1.65619 9.35618 1.65619 7.99988C1.65619 4.49632 4.4964 1.65613 7.99997 1.65613C11.5035 1.65613 14.3438 4.49632 14.3438 7.99988Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                      <ellipse cx="7.25095" cy="8" rx="1.2" ry="1.2" fill="currentColor" />
                      <ellipse cx="10.8437" cy="8" rx="1.2" ry="1.2" fill="currentColor" />
                    </svg>
                    <span>{item.article_comments_count || 0}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path d="M4.03769 5.87315L7.99993 1.91089M7.99993 1.91089L11.9622 5.87315M7.99993 1.91089V11.0702" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1.87497 9.27661V12.3391C1.87497 13.3056 2.65847 14.0891 3.62497 14.0891H12.375C13.3415 14.0891 14.125 13.3056 14.125 12.3391V9.27661" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{item.article_share_count || 0}</span>
                  </span>
                </div>
                <Link href={getArticleUrl(item)} className="inline-flex items-center px-2.5 py-0.5 text-sm border-1 border-[#555333] rounded-full text-[#555333] bg-white hover:bg-gray-50 no-underline" style={{ borderRadius: "20px" }}>
                  Tanggapi
                </Link>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center mt-3 mb-3">
              <button className="px-3 py-1 text-sm border rounded border-gray-300" onClick={handleLoadMore} disabled={loadingMore} style={{ fontSize: "0.8rem" }}>
                {loadingMore ? (
                  <><span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></span>Memuat...</>
                ) : (
                  "Muat Lebih Banyak"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p style={{ fontSize: "0.85rem" }}>Belum ada tanggapan.</p>
        </div>
      )}
    </div>
  );
}