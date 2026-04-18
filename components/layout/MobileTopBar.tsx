"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MobileTopBar() {
  // State sementara untuk simulasi: true = ada notif, false = tidak ada notif.
  // Nanti nilai ini bisa kamu ambil dari context, API, atau props.
  const [hasNotification, setHasNotification] = useState(true);

  return (
    // Tag div dengan w-full flex-1 dan relative agar membentang penuh
    <div className="lg:hidden w-full flex-1 flex items-center justify-between relative">
      
      {/* Kiri: Ikon Profil */}
      <button
        className="flex-shrink-0 transition-opacity hover:opacity-80"
        aria-label="Profil"
      >
        <Image
          src="/icons/login-mobile.svg"
          alt="Profil"
          width={28}
          height={28}
          className="w-[28px] h-[28px] object-contain"
        />
      </button>

      {/* Tengah: Logo Presisi */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex pt-1 items-center justify-center">
        <Link href="/" aria-label="Beranda" className="flex items-center">
          <Image
            src="/telisik-logo.svg"
            alt="Telisik Logo"
            width={90}
            height={26}
            className="w-auto h-[26px] object-contain"
          />
        </Link>
      </div>

      {/* Kanan: Lonceng, Kaca Pembesar, Upload */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="transition-opacity hover:opacity-70 flex items-center justify-center p-0.5"
          aria-label="Notifikasi"
          onClick={() => setHasNotification(!hasNotification)} // Simulasi klik untuk mengubah state (bisa dihapus nanti)
        >
          <Image
            // Logic pergantian gambar: Jika hasNotification true pakai dari folder /iconsactive/, jika tidak dari /icons/
            src={hasNotification ? "/iconsactive/notifications.svg" : "/icons/notifications.svg"}
            alt="Notifikasi"
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain"
          />
        </button>

        <button
          className="transition-opacity hover:opacity-70 flex items-center justify-center p-0.5"   
          aria-label="Cari"
        >
          <Image
            src="/icons/search.svg"
            alt="Cari"
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain"
          />
        </button>

        <button
          className="transition-transform hover:scale-105 active:scale-95 ml-1 bg-[#35C759] rounded-full p-1"
          aria-label="Upload"
        >
          <Image
            src="/icons/download.svg" 
            alt="Upload"
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain"
          />
        </button>
      </div>
      
    </div>
  );
}