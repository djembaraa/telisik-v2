"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { Alert, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import ArticleCardGrid from "@/features/article/components/ArticleCardGrid";
import MapContainer from "./MapContainer";
import KredoBox from "./KredoBox";
import useHomepageSearch, {
  HOMEPAGE_AREA_ORDER,
} from "../hooks/useHomepageSearch";
import {
  fetchDiskursus,
  fetchHomepageMarkers,
  fetchKredo,
} from "../services/beranda.service";
import type {
  HomepageAreaKey,
  HomepageSearchController,
  LocationOption,
  MapMarker,
  MarkerCategory,
  KredoData,
} from "../types";
import type { ArticleCardItem } from "@/features/article/types";

const HOMEPAGE_AREA_LABELS: Record<HomepageAreaKey, string> = {
  kronik: "Kronik",
  tilik: "Tilik",
  diskursus: "Diskursus",
  tanggapan: "Tanggapan",
};

function HomepageSearchIcon({
  className = "h-4 w-4",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <circle
        cx="7.5"
        cy="7.5"
        r="5.9"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 12L14.3827 14.3827"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomepageClearIcon({
  className = "h-4 w-4",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4L12 12" />
      <path d="M12 4L4 12" />
    </svg>
  );
}

function HomepageChevronIcon({
  open = false,
  className = "h-4 w-4",
  color = "currentColor",
}: {
  open?: boolean;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? <path d="M4 10L8 6L12 10" /> : <path d="M4 6L8 10L12 6" />}
    </svg>
  );
}

function HomepageSlider({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "relative mt-1 inline-flex h-3 w-7 shrink-0 items-center rounded-[50px] border p-1 transition-colors",
        checked
          ? "justify-end border-[#717061] bg-[#35C759]"
          : "border-[#717061] bg-[#F9F6EF]",
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          "rounded-full",
          checked ? "h-[9px] w-[9px] bg-white" : "h-2 w-2 bg-[#878672]",
        )}
      />
    </span>
  );
}

function HomepageCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px] border transition-colors",
        checked
          ? "border-[#35C759] bg-[#35C759] text-white"
          : "border-[#878672] bg-white text-transparent",
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        className="h-[10px] w-[10px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5L6.2 11.2L12.5 4.8" />
      </svg>
    </span>
  );
}

function ResultSection({
  title,
  results,
}: {
  title: string;
  results: ArticleCardItem[];
}) {
  return (
    <section className="space-y-1">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-[2rem] font-bold text-[#FC6736]">{title}</h2>
        <span className="text-sm italic text-[#878672]">
          {results.length} hasil
        </span>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-14 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCardGrid
              key={`${title}-${article.type ?? "default"}-${article.id ?? article.slug}`}
              article={article}
              variant="home"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#ddd5c0] bg-[#fffdf8] px-5 py-6 text-sm text-[#878672]">
          Belum ada hasil untuk {title}.
        </div>
      )}
    </section>
  );
}

function HomepageSearchPanel({
  controller,
}: {
  controller: HomepageSearchController;
}) {
  const { state, provinceSuggestions, regencySuggestions } = controller;
  const panelRef = useRef<HTMLDivElement>(null);
  const [showProvinceMenu, setShowProvinceMenu] = useState(false);
  const [highlightedProvinceIndex, setHighlightedProvinceIndex] = useState(-1);
  const [showRegencyMenu, setShowRegencyMenu] = useState(false);
  const [highlightedRegencyIndex, setHighlightedRegencyIndex] = useState(-1);

  const activeProvinceIndex =
    showProvinceMenu && provinceSuggestions.length > 0
      ? Math.min(
          Math.max(highlightedProvinceIndex, 0),
          provinceSuggestions.length - 1,
        )
      : -1;
  const activeRegencyIndex =
    showRegencyMenu && regencySuggestions.length > 0
      ? Math.min(
          Math.max(highlightedRegencyIndex, 0),
          regencySuggestions.length - 1,
        )
      : -1;

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowProvinceMenu(false);
        setHighlightedProvinceIndex(-1);
        setShowRegencyMenu(false);
        setHighlightedRegencyIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  const handleAdvancedToggle = () => {
    const nextOpen = !state.isAdvancedOpen;
    controller.onAdvancedToggle();
    if (!nextOpen) {
      setShowProvinceMenu(false);
      setHighlightedProvinceIndex(-1);
      setShowRegencyMenu(false);
      setHighlightedRegencyIndex(-1);
    }
  };

  const handleLokasiToggle = () => {
    const nextEnabled = !state.lokasiEnabled;
    controller.onLokasiToggle();
    if (!nextEnabled) {
      setShowProvinceMenu(false);
      setHighlightedProvinceIndex(-1);
      setShowRegencyMenu(false);
      setHighlightedRegencyIndex(-1);
    }
  };

  const selectProvinceSuggestion = (option: LocationOption) => {
    controller.onProvinceSelect(option);
    setShowProvinceMenu(false);
    setHighlightedProvinceIndex(-1);
    setShowRegencyMenu(false);
    setHighlightedRegencyIndex(-1);
  };

  const selectRegencySuggestion = (option: LocationOption) => {
    controller.onRegencySelect(option);
    setShowRegencyMenu(false);
    setHighlightedRegencyIndex(-1);
  };

  const handleProvinceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!state.lokasiEnabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!provinceSuggestions.length) return;
      setShowProvinceMenu(true);
      const nextIndex =
        activeProvinceIndex >= provinceSuggestions.length - 1
          ? 0
          : Math.max(activeProvinceIndex, -1) + 1;
      setHighlightedProvinceIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!provinceSuggestions.length) return;
      setShowProvinceMenu(true);
      const nextIndex =
        activeProvinceIndex <= 0
          ? provinceSuggestions.length - 1
          : activeProvinceIndex - 1;
      setHighlightedProvinceIndex(nextIndex);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (showProvinceMenu && activeProvinceIndex >= 0) {
        selectProvinceSuggestion(provinceSuggestions[activeProvinceIndex]);
        return;
      }
      void controller.onSubmit();
      return;
    }

    if (event.key === "Escape") {
      setShowProvinceMenu(false);
      setHighlightedProvinceIndex(-1);
    }
  };

  const handleRegencyKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!state.lokasiEnabled || !state.selectedProvince) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!regencySuggestions.length) return;
      setShowRegencyMenu(true);
      const nextIndex =
        activeRegencyIndex >= regencySuggestions.length - 1
          ? 0
          : Math.max(activeRegencyIndex, -1) + 1;
      setHighlightedRegencyIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!regencySuggestions.length) return;
      setShowRegencyMenu(true);
      const nextIndex =
        activeRegencyIndex <= 0
          ? regencySuggestions.length - 1
          : activeRegencyIndex - 1;
      setHighlightedRegencyIndex(nextIndex);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (showRegencyMenu && activeRegencyIndex >= 0) {
        selectRegencySuggestion(regencySuggestions[activeRegencyIndex]);
        return;
      }
      void controller.onSubmit();
      return;
    }

    if (event.key === "Escape") {
      setShowRegencyMenu(false);
      setHighlightedRegencyIndex(-1);
    }
  };

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-[#e6dfc9] bg-[#fffdf8] px-4 py-4 shadow-[0_10px_24px_rgba(85,83,51,0.06)]"
    >
      <div className="pb-2">
        <h3 className="text-[26px] font-bold leading-[34px] text-[#FC6736]">
          Temukan
        </h3>
      </div>

      <div className="py-2">
        <div className="flex items-center gap-2 rounded-[50px] border border-[#CECB9C] bg-white px-4 py-2">
          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-[#555333] placeholder:text-[#878672] focus:outline-none"
            placeholder="Lorem ipsum search"
            value={state.query}
            onChange={(event) => controller.onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void controller.onSubmit();
              }
            }}
          />

          {state.query && (
            <button
              type="button"
              onClick={controller.onQueryClear}
              className="inline-flex h-4 w-4 items-center justify-center text-[#FF2D55]"
              aria-label="Clear search"
            >
              <HomepageClearIcon color="currentColor" />
            </button>
          )}

          <button
            type="button"
            onClick={() => void controller.onSubmit()}
            className="inline-flex h-4 w-4 items-center justify-center text-[#08F]"
            aria-label="Search"
          >
            <HomepageSearchIcon color="currentColor" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "rounded-[4px] bg-transparent",
          state.isAdvancedOpen
            ? "border border-[#08F]"
            : "border border-transparent",
        )}
      >
        <div className="px-2 py-2">
          <button
            type="button"
            onClick={handleAdvancedToggle}
            aria-pressed={state.isAdvancedOpen}
            className="flex items-start gap-3 text-left"
          >
            <HomepageSlider checked={state.isAdvancedOpen} />
            <span className="text-[16px] italic leading-5 text-[#555333]">
              Perinci pencarian
            </span>
          </button>
        </div>

        {state.isAdvancedOpen && (
          <>
            <div className="flex flex-col gap-4 px-4 pb-3 pt-2">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleLokasiToggle}
                  aria-pressed={state.lokasiEnabled}
                  className="flex items-start gap-3 text-left"
                >
                  <HomepageSlider checked={state.lokasiEnabled} />
                  <span className="text-[16px] leading-5 text-[#555333]">
                    Lokasi
                  </span>
                </button>

                {state.lokasiEnabled && (
                  <div className="mt-3 space-y-1 pl-[34px]">
                    <div className="relative">
                      <div className="flex items-center gap-2 rounded-[4px] border border-[#08F] bg-white px-3 py-2">
                        <input
                          type="text"
                          className={cn(
                            "min-w-0 flex-1 bg-transparent text-[16px] leading-6 placeholder:text-[#878672] focus:outline-none",
                            state.selectedProvince
                              ? "text-[#08F]"
                              : state.provinceQuery
                              ? "text-[#555333]"
                              : "text-[#878672]",
                          )}
                          placeholder="Pilih provinsi"
                          value={state.provinceQuery}
                          onFocus={() => {
                            setShowProvinceMenu(true);
                            setShowRegencyMenu(false);
                          }}
                          onChange={(event) => {
                            controller.onProvinceQueryChange(event.target.value);
                            setShowProvinceMenu(true);
                            setShowRegencyMenu(false);
                          }}
                          onKeyDown={handleProvinceKeyDown}
                          aria-label="Pilih provinsi"
                        />

                        {state.provinceQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              controller.onProvinceClear();
                              setShowProvinceMenu(false);
                              setHighlightedProvinceIndex(-1);
                              setShowRegencyMenu(false);
                              setHighlightedRegencyIndex(-1);
                            }}
                            className="inline-flex h-4 w-4 items-center justify-center text-[#FF2D55]"
                            aria-label="Clear province"
                          >
                            <HomepageClearIcon color="currentColor" />
                          </button>
                        )}

                        <button
                          type="button"
                          className="inline-flex h-4 w-4 items-center justify-center text-[#D6CFA8]"
                          onClick={() => {
                            setShowProvinceMenu((current) => !current);
                            setShowRegencyMenu(false);
                          }}
                          aria-label="Toggle province suggestions"
                          aria-expanded={showProvinceMenu}
                        >
                          <HomepageChevronIcon
                            open={showProvinceMenu}
                            color="currentColor"
                          />
                        </button>
                      </div>

                      {showProvinceMenu && (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[4px] border border-[#08F] bg-white shadow-[0_8px_18px_rgba(85,83,51,0.08)]">
                          <div className="max-h-56 overflow-y-auto">
                            {provinceSuggestions.length > 0 ? (
                              provinceSuggestions.map((option, index) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectProvinceSuggestion(option);
                                  }}
                                  onMouseEnter={() =>
                                    setHighlightedProvinceIndex(index)
                                  }
                                  className={cn(
                                    "flex w-full items-center border-b border-[#E6DFC9] px-3 py-2 text-left text-[16px] leading-6 last:border-b-0",
                                    activeProvinceIndex === index
                                      ? "bg-[#EEF9F1] text-[#555333]"
                                      : "bg-white text-[#555333]",
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-[14px] text-[#878672]">
                                Provinsi tidak ditemukan.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-2 rounded-[4px] border border-[#08F] bg-white px-3 py-2">
                        <input
                          type="text"
                          className={cn(
                            "min-w-0 flex-1 bg-transparent text-[16px] leading-6 placeholder:text-[#878672] focus:outline-none disabled:text-[#B3AB95]",
                            state.selectedRegency
                              ? "text-[#555333]"
                              : "text-[#878672]",
                          )}
                          placeholder="Nama kabupaten/kota"
                          value={state.regencyQuery}
                          disabled={!state.selectedProvince}
                          onFocus={() => {
                            if (state.selectedProvince) {
                              setShowRegencyMenu(true);
                              setShowProvinceMenu(false);
                            }
                          }}
                          onChange={(event) => {
                            controller.onRegencyQueryChange(event.target.value);
                            setShowRegencyMenu(true);
                            setShowProvinceMenu(false);
                          }}
                          onKeyDown={handleRegencyKeyDown}
                          aria-label="Pilih kabupaten atau kota"
                        />

                        {state.regencyQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              controller.onRegencyClear();
                              setShowRegencyMenu(false);
                              setHighlightedRegencyIndex(-1);
                            }}
                            className="inline-flex h-4 w-4 items-center justify-center text-[#FF2D55]"
                            aria-label="Clear regency"
                          >
                            <HomepageClearIcon color="currentColor" />
                          </button>
                        )}

                        <button
                          type="button"
                          className={cn(
                            "inline-flex h-4 w-4 items-center justify-center",
                            state.selectedProvince
                              ? "text-[#08F]"
                              : "text-[#D6CFA8]",
                          )}
                          onClick={() =>
                            state.selectedProvince &&
                            setShowRegencyMenu((current) => !current)
                          }
                          aria-label="Toggle regency suggestions"
                          aria-expanded={showRegencyMenu}
                        >
                          <HomepageChevronIcon
                            open={showRegencyMenu}
                            color="currentColor"
                          />
                        </button>
                      </div>

                      {showRegencyMenu && state.selectedProvince && (
                        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[4px] border border-[#08F] bg-white shadow-[0_8px_18px_rgba(85,83,51,0.08)]">
                          <div className="max-h-56 overflow-y-auto">
                            {regencySuggestions.length > 0 ? (
                              regencySuggestions.map((option, index) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectRegencySuggestion(option);
                                  }}
                                  onMouseEnter={() =>
                                    setHighlightedRegencyIndex(index)
                                  }
                                  className={cn(
                                    "flex w-full items-center border-b border-[#E6DFC9] px-3 py-2 text-left text-[16px] leading-6 last:border-b-0",
                                    activeRegencyIndex === index
                                      ? "bg-[#EEF9F1] text-[#555333]"
                                      : "bg-white text-[#555333]",
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-[14px] text-[#878672]">
                                Kabupaten/kota tidak ditemukan.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-[6px]">
                <button
                  type="button"
                  onClick={controller.onJenisKonflikToggle}
                  aria-pressed={state.jenisKonflikEnabled}
                  className="flex items-start gap-3 text-left"
                >
                  <HomepageSlider checked={state.jenisKonflikEnabled} />
                  <span className="text-[16px] leading-5 text-[#555333]">
                    Jenis Konflik
                  </span>
                </button>

                {state.jenisKonflikEnabled && (
                  <div className="mt-3 space-y-1 pl-12">
                    {controller.conflictOptions.map((option) => {
                      const checked = state.selectedConflictTypes.includes(
                        option.id,
                      );

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => controller.onConflictToggle(option.id)}
                          className="flex w-full items-start gap-2 text-left"
                        >
                          <HomepageCheckbox checked={checked} />
                          <span
                            className={cn(
                              "mb-1 text-[14px] leading-5",
                              checked ? "text-[#555333]" : "text-[#878672]",
                            )}
                          >
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#CECB9C] px-4 pb-1 pt-3">
              <p className="mb-2 text-[14px] italic leading-[18px] text-[#878672]">
                Area pencarian:
              </p>

              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  {(["kronik", "tilik", "diskursus"] as HomepageAreaKey[]).map(
                    (areaKey) => {
                      const checked = state.selectedAreas[areaKey];

                      return (
                        <button
                          key={areaKey}
                          type="button"
                          onClick={() => controller.onAreaToggle(areaKey)}
                          className="flex items-start gap-2 text-left"
                        >
                          <HomepageCheckbox checked={checked} />
                          <span className="text-[16px] leading-5 text-[#555333]">
                            {HOMEPAGE_AREA_LABELS[areaKey]}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => controller.onAreaToggle("tanggapan")}
                  className="flex items-start gap-2 text-left"
                >
                  <HomepageCheckbox checked={state.selectedAreas.tanggapan} />
                  <span className="text-[16px] leading-5 text-[#555333]">
                    Tanggapan
                  </span>
                </button>
              </div>

              <div className="flex justify-end pb-2 pt-4">
                <button
                  type="button"
                  onClick={() => void controller.onSubmit()}
                  className="inline-flex items-center gap-[6px] rounded-full border-[3px] border-[#CECB9C] bg-[#555333] px-3 py-[7px] text-[14px] font-medium leading-[14px] text-[#F9F6EF] transition hover:brightness-95"
                >
                  <HomepageSearchIcon color="currentColor" />
                  <span>{state.isSearching ? "Memuat..." : "Temukan"}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BerandaPage({
  homepageSearch = null,
}: {
  homepageSearch?: HomepageSearchController | null;
}) {
  const user = useAuthStore((state) => state.user);
  const [diskursus, setDiskursus] = useState<ArticleCardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [kredo, setKredo] = useState<KredoData>({});
  const [activeCategories, setActiveCategories] = useState<
    Set<MarkerCategory>
  >(new Set());

  const fallbackHomepageSearch = useHomepageSearch({
    enabled: !homepageSearch,
  });
  const homepageSearchController = homepageSearch ?? fallbackHomepageSearch;
  const homepageSearchState = homepageSearchController.state;
  const activeError = error || homepageSearchController.errorMessage;

  useEffect(() => {
    let ignore = false;

    fetchHomepageMarkers()
      .then((data) => {
        if (!ignore) setMarkers(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchKredo()
      .then((data) => {
        if (!ignore) setKredo(data ?? {});
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchDiskursus(12)
      .then((data) => {
        if (!ignore) setDiskursus(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCategoryToggle = (category: MarkerCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const selectedSearchAreas = useMemo(
    () =>
      HOMEPAGE_AREA_ORDER.filter(
        (areaKey) => homepageSearchState.selectedAreas[areaKey],
      ),
    [homepageSearchState.selectedAreas],
  );
  const hasAnyHomepageResults = useMemo(
    () =>
      selectedSearchAreas.some(
        (areaKey) =>
          (homepageSearchState.searchResultsByType[areaKey] || []).length > 0,
      ),
    [homepageSearchState.searchResultsByType, selectedSearchAreas],
  );

  return (
    <div className="min-h-screen bg-[#f6f3eb] lg:h-[calc(100vh-60px)] lg:min-h-0 lg:overflow-hidden">
      {activeError && (
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white p-4">
          <div className="mx-auto max-w-7xl">
            <Alert
              type="danger"
              message={activeError}
              onClose={() => {
                if (error) {
                  setError(null);
                }
                if (homepageSearchController.errorMessage) {
                  homepageSearchController.clearError();
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-60px)] flex-col lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <aside
          className={cn(
            "hidden bg-[#faf8f1] transition-[width,padding] duration-200 lg:block lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain",
            collapsed ? "lg:w-[72px]" : "lg:w-[265px] xl:w-[275px]",
          )}
        >
          <LeftSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        </aside>

        <main className="flex-1 bg-[#faf8f1] lg:h-full lg:overflow-y-auto lg:overscroll-contain">
          <div className="mx-auto w-full max-w-none space-y-4 px-3 py-3 sm:px-4 sm:py-4 lg:space-y-5 lg:px-4 xl:px-4">
            <div className="space-y-1 lg:space-y-2">
              <MapContainer
                markers={markers}
                activeCategories={activeCategories}
                onCategoryToggle={handleCategoryToggle}
                className="rounded-none shadow-none"
              />

              {!homepageSearchState.hasSubmittedSearch && kredo.heading ? (
                <KredoBox
                  heading={kredo.heading}
                  lead={kredo.lead}
                  body={kredo.body}
                />
              ) : null}
            </div>

            <div className="-space-y-1">
              {homepageSearchState.hasSubmittedSearch ? (
                homepageSearchState.isSearching ? (
                  <div className="grid grid-cols-2 gap-x-14 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`search-skeleton-${index}`} className="space-y-2">
                        <Skeleton heightClassName="h-40" />
                        <Skeleton count={2} />
                      </div>
                    ))}
                  </div>
                ) : selectedSearchAreas.length === 0 ? (
                  <div className="rounded-2xl border border-[#ddd5c0] bg-[#fffdf8] px-5 py-6 text-center text-[#878672]">
                    Pilih minimal satu area pencarian untuk menampilkan hasil.
                  </div>
                ) : (
                  <>
                    <div className="px-0">
                      <h2 className="text-2xl font-bold leading-tight text-[#555333]">
                        Hasil Temuan
                      </h2>
                      <p className="mt-2 text-sm italic text-[#878672]">
                        {homepageSearchState.query
                          ? `Menampilkan hasil untuk "${homepageSearchState.query}".`
                          : "Menampilkan hasil berdasarkan filter yang dipilih."}
                      </p>
                    </div>

                    {selectedSearchAreas.map((areaKey) => {
                      if (areaKey === "tanggapan") {
                        return (
                          <section key={areaKey} className="space-y-3">
                            <div className="flex items-end justify-between gap-3">
                              <h2 className="text-[2rem] font-bold text-[#FC6736]">
                                {HOMEPAGE_AREA_LABELS[areaKey]}
                              </h2>
                              <span className="text-sm italic text-[#878672]">
                                belum tersedia
                              </span>
                            </div>
                            <div className="rounded-2xl border border-[#ddd5c0] bg-[#fffdf8] px-5 py-6 text-sm text-[#878672]">
                              Hasil tanggapan belum tersedia di homepage saat
                              ini.
                            </div>
                          </section>
                        );
                      }

                      return (
                        <ResultSection
                          key={areaKey}
                          title={HOMEPAGE_AREA_LABELS[areaKey]}
                          results={
                            homepageSearchState.searchResultsByType[areaKey] ||
                            []
                          }
                        />
                      );
                    })}

                    {!hasAnyHomepageResults && (
                      <div className="rounded-2xl border border-dashed border-[#d5ccb5] bg-[#fffdf8] px-5 py-8 text-center text-[#878672]">
                        Tidak ada hasil yang cocok dengan kombinasi filter ini.
                      </div>
                    )}
                  </>
                )
              ) : loading ? (
                <div className="grid grid-cols-2 gap-x-14 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`feed-skeleton-${index}`} className="space-y-2">
                      <Skeleton heightClassName="h-40" />
                      <Skeleton count={2} />
                    </div>
                  ))}
                </div>
              ) : diskursus.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-14 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
                  {diskursus.map((article) => (
                    <ArticleCardGrid
                      key={article.id ?? article.slug}
                      article={article}
                      variant="home"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
                  <p className="text-neutral-600">Belum ada artikel diskursus</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden bg-[#faf8f1] lg:block lg:h-full lg:w-[385px] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain xl:w-[395px]">
          <div className="px-4 py-3">
            <HomepageSearchPanel controller={homepageSearchController} />
          </div>
        </aside>
      </div>

      {user ? (
        <Link
          href="/urun-daya/kronik"
          aria-label="Tambah artikel"
          className="fixed right-4 z-40 flex h-[46px] w-[46px] items-center justify-center rounded-full border-[2.5px] border-[#f6a88f] bg-[#FC6736] text-white shadow-[0_8px_18px_rgba(252,103,54,0.32)] transition-transform duration-150 active:scale-95 md:hidden"
          style={{
            bottom:
              "calc(var(--mobile-bottom-nav-content-height) + env(safe-area-inset-bottom) + 18px)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}
