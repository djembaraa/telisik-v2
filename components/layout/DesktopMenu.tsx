"use client";

import Link from "next/link";
import { MAIN_NAVIGATION } from "../../types/nav";
import { usePathname } from "next/navigation";

export default function DesktopMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center">
      {MAIN_NAVIGATION.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        const inactiveIconPath = item.iconPath.replace("/menus/", "/menusnonaktif/");

        return (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl uppercase text-sm tracking-wide transition-all duration-200 ease-out"
          >
            <span
              className={`shrink-0 block w-[20px] h-[20px] ${
                isActive ? "" : "bg-[#878672] group-hover:bg-[#FC6736]"
              }`}
              style={
                isActive
                  ? {
                      backgroundImage: `url(${item.iconPath})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }
                  : {
                      maskImage: `url(${inactiveIconPath})`,
                      maskSize: "contain",
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskImage: `url(${inactiveIconPath})`,
                      WebkitMaskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                    }
              }
              aria-hidden="true"
            />
            <span
              className={`transition-colors duration-200 ease-out ${
                isActive
                  ? "text-[#FC6736]"
                  : "text-[#555333] group-hover:text-[#FC6736]"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}