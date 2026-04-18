"use client";

import Link from "next/link";
import Image from "next/image";
import { MAIN_NAVIGATION } from "@/types/nav";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] bg-[#F9F6EF] dark:bg-[#403E3C] border-t border-neutral-200 dark:border-neutral-800 pb-safe">
      <div className="flex items-center justify-around h-[64px] px-2">
        {MAIN_NAVIGATION.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          const inactiveIconPath = item.iconPath.replace(
            "/menus/",
            "/menusnonaktif/",
          );

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all
                ${isActive ? "text-[#F15A24]" : "text-[#8E8C87] hover:text-[#F15A24] dark:text-[#A09E99]"}
              `}
            >
              <Image
                src={isActive ? item.iconPath : inactiveIconPath}
                alt={item.label}
                width={19}
                height={19}
              />
              <span className="text-[11px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}