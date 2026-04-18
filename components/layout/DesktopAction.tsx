"use client";

import { useEffect, useState } from "react";

export default function DesktopActions() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initialIsDark = storedTheme
      ? storedTheme === "dark"
      : Boolean(prefersDark);

    setIsDark(initialIsDark);
    document.documentElement.classList.toggle("dark", initialIsDark);
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const sunIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  );

  const moonIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <div className="hidden lg:flex items-center gap-4 shrink-0">
      <button className="inline-flex items-center justify-center gap-1.5 px-4 py-[6px] text-[15px] font-base text-white bg-[#FC6736] rounded-full hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(252,103,54,0.18)] transition-all">
        
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="shrink-0"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>

        <span>Urun Daya</span>
      </button>
      
      <button
        type="button"
        aria-label="Toggle theme"
        aria-pressed={isDark}
        onClick={handleToggleTheme}
        className={`relative inline-flex h-[30px] w-[70px] items-center rounded-full border-[0.5px] shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-telisik/30 ${
          isDark
            ? "border-primary-light bg-surface-dark"
            : "border-primary-light bg-white"
        }`}
      >
        <span
          className={`absolute left-[2px] top-1/2 z-10 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300 ease-out ${
            isDark
              ? "translate-x-[38px] bg-white text-[#878672]"
              : "translate-x-0 bg-[#827E6A] text-white"
          }`}
        >
          {isDark ? moonIcon : sunIcon}
        </span>
        <span
          className={`absolute top-1/2 z-0 flex h-[16px] w-[16px] -translate-y-1/2 items-center justify-center text-primary-light transition-colors duration-300 ease-out ${
            isDark ? "left-[7px]" : "right-[7px] "
          }`}
        >
          {isDark ? sunIcon : moonIcon}
        </span>
      </button>
    </div>
  );
}