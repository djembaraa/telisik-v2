"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import LeftSidebar from "@/components/layout/LeftSidebar";
import { API_BASE } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);

  const mediaBase = API_BASE || "https://api.telisik.org";
  const resolvedAvatar =
    typeof user?.avatar === "string" && user.avatar
      ? user.avatar.startsWith("/static/")
        ? `${mediaBase}${user.avatar}`
        : user.avatar.startsWith("static/")
        ? `${mediaBase}/${user.avatar}`
        : user.avatar
      : "";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef] lg:h-[calc(100vh-var(--site-top-nav-height-desktop))] lg:min-h-0 lg:overflow-hidden">
      <div className="flex min-h-[calc(100vh-var(--site-top-nav-height-desktop))] flex-col lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <aside className="hidden bg-[#faf8f1] transition-[width,padding] duration-200 lg:block lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain">
          <LeftSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </aside>

        <main className="relative z-0 min-w-0 flex-1 overflow-x-hidden bg-[#faf8f1] px-0 pt-5 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pt-6">
          <div className="mx-auto w-full max-w-4xl space-y-6 px-4 pb-10 lg:px-6">
            <div>
              <h1 className="text-3xl font-bold text-[#2d2a26]">Profil</h1>
              <p className="text-sm text-[#6b665f] md:text-base">
                Kelola informasi akun dan preferensi.
              </p>
            </div>

            {user ? (
              <div className="rounded-2xl border border-[#e6dfc9] bg-[#fffdf8] p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#e6dfc9] bg-[#f6f0e4]">
                      {resolvedAvatar ? (
                        <img
                          src={resolvedAvatar}
                          alt={user.display_name || "Foto profil"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-[#b6afa7]">
                          {(user.display_name || user.username || "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-[#2d2a26]">
                        {user.display_name || "Pengguna Telisik"}
                      </div>
                      <div className="text-sm text-[#8c857d]">
                        @{user.username || "username"}
                      </div>
                      {user.email && (
                        <div className="text-sm text-[#8c857d]">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-full border border-[#fd6932] px-4 py-2 text-sm font-semibold text-[#fd6932] transition hover:bg-[#fff0e6]"
                  >
                    Keluar
                  </button>
                </div>

                <div className="mt-5 grid gap-3 rounded-xl border border-dashed border-[#e6dfc9] bg-[#fdf9f0] p-4 text-sm text-[#6b665f]">
                  <div className="font-semibold text-[#4c4640]">
                    Tips profil
                  </div>
                  <p>
                    Lengkapi informasi profil agar komunitas mudah mengenal kamu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e6dfc9] bg-[#fffdf8] p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f0e4] text-[#fd6932]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#2d2a26]">
                  Kamu belum masuk
                </h2>
                <p className="mt-2 text-sm text-[#6b665f]">
                  Masuk atau daftar untuk melihat aktivitas dan mengelola profil.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/login"
                    className="rounded-full bg-[#fd6932] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className={cn(
                      "rounded-full border border-[#fd6932] px-4 py-2 text-sm font-semibold text-[#fd6932] transition",
                      "hover:bg-[#fff0e6]",
                    )}
                  >
                    Daftar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
