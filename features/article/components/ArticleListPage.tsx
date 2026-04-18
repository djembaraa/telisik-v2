"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import LeftSidebar from "@/components/layout/LeftSidebar";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/config";
import { useAuthStore } from "@/store/useAuthStore";
import ArticleCardGrid from "./ArticleCardGrid";
import type { ArticleCardItem } from "../types";

export type ArticleListType = "kronik" | "tilik" | "diskursus";

interface LocationOption {
  label: string;
  value: string;
}

interface ArticleListFilters {
  query: string;
  isAdvancedOpen: boolean;
  lokasiEnabled: boolean;
  jenisKonflikEnabled: boolean;
  provinceQuery: string;
  selectedProvince: string;
  regencyQuery: string;
  selectedRegency: string;
  selectedConflictTypes: string[];
  category: string;
}

interface AppliedFilters {
  query: string;
  lokasiEnabled: boolean;
  jenisKonflikEnabled: boolean;
  selectedProvince: string;
  selectedRegency: string;
  selectedConflictTypes: string[];
  category: string;
}

const TYPE_META: Record<ArticleListType, { title: string; subtitle: string }> = {
  kronik: {
    title: "Kronik",
    subtitle: "Dokumentasi konflik yang sedang berlangsung.",
  },
  tilik: {
    title: "Tilik",
    subtitle: "Dokumentasi potensi konflik yang bisa terjadi.",
  },
  diskursus: {
    title: "Diskursus",
    subtitle: "Ruang diskursus dan analisis dari berbagai perspektif.",
  },
};

const CATEGORY_OPTIONS = [
  { key: "semua", label: "Semua" },
  { key: "agraria", label: "Agraria" },
  { key: "ekosospol", label: "Ekosospol" },
  { key: "sumber-daya-alam", label: "Sumber Daya Alam" },
];

const CONFLICT_OPTIONS = [
  { id: "sda", label: "Sumber Daya Alam" },
  { id: "agraria", label: "Agraria" },
  { id: "ekonomi", label: "Ekonomi" },
  { id: "sosial", label: "Sosial" },
  { id: "budaya", label: "Budaya" },
  { id: "politik", label: "Politik" },
  { id: "militer", label: "Militer" },
];

const resolveApiUrl = (path: string) => {
  if (!API_BASE) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const normalizeLocationOptions = (list: LocationOption[]) =>
  list
    .map((item) => ({
      label: item.label?.trim() || "",
      value: item.value?.trim() || "",
    }))
    .filter((item) => item.label && item.value);

const normalizeLocationList = (payload: unknown): LocationOption[] => {
  if (Array.isArray(payload)) {
    return normalizeLocationOptions(payload as LocationOption[]);
  }
  if (!payload || typeof payload !== "object") return [];

  const typedPayload = payload as Record<string, string>;
  const entries = Object.entries(typedPayload).map(([value, label]) => ({
    label,
    value,
  }));
  return normalizeLocationOptions(entries);
};

const getCategoryLabel = (key: string) =>
  CATEGORY_OPTIONS.find((option) => option.key === key)?.label || "Semua";

const parseFiltersFromParams = (params: URLSearchParams) => {
  const query = params.get("q") || "";
  const rawCategory = params.get("category") || "semua";
  const category =
    CATEGORY_OPTIONS.find((option) => option.key === rawCategory)?.key || "semua";
  const selectedProvince = params.get("province") || "";
  const selectedRegency = params.get("regency") || "";
  const conflictParam = params.get("jenis_konflik") || "";
  const selectedConflictTypes = conflictParam
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const lokasiEnabled = Boolean(selectedProvince || selectedRegency);
  const jenisKonflikEnabled = selectedConflictTypes.length > 0;

  return {
    query,
    category,
    selectedProvince,
    selectedRegency,
    selectedConflictTypes,
    lokasiEnabled,
    jenisKonflikEnabled,
  };
};

const buildAppliedFilters = (filters: ArticleListFilters): AppliedFilters => {
  const cleanedQuery = filters.query.trim();
  const safeCategory =
    CATEGORY_OPTIONS.find((option) => option.key === filters.category)?.key ||
    "semua";
  const lokasiEnabled = filters.lokasiEnabled;
  const jenisKonflikEnabled = filters.jenisKonflikEnabled;

  return {
    query: cleanedQuery,
    category: safeCategory,
    lokasiEnabled,
    jenisKonflikEnabled,
    selectedProvince: lokasiEnabled ? filters.selectedProvince : "",
    selectedRegency: lokasiEnabled ? filters.selectedRegency : "",
    selectedConflictTypes: jenisKonflikEnabled
      ? filters.selectedConflictTypes
      : [],
  };
};

const buildSearchParams = (filters: AppliedFilters) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "semua") {
    params.set("category", filters.category);
  }
  if (filters.query) params.set("q", filters.query);
  if (filters.lokasiEnabled && filters.selectedProvince) {
    params.set("province", filters.selectedProvince);
  }
  if (filters.lokasiEnabled && filters.selectedRegency) {
    params.set("regency", filters.selectedRegency);
  }
  if (filters.jenisKonflikEnabled && filters.selectedConflictTypes.length > 0) {
    params.set("jenis_konflik", filters.selectedConflictTypes.join(","));
  }
  return params;
};

const createDefaultFilters = (): ArticleListFilters => ({
  query: "",
  isAdvancedOpen: true,
  lokasiEnabled: false,
  jenisKonflikEnabled: false,
  provinceQuery: "",
  selectedProvince: "",
  regencyQuery: "",
  selectedRegency: "",
  selectedConflictTypes: [],
  category: "semua",
});

interface ArticleListSearchPanelProps {
  filters: ArticleListFilters;
  setFilters: Dispatch<SetStateAction<ArticleListFilters>>;
  provinces: LocationOption[];
  regencies: LocationOption[];
  loadingProvinces: boolean;
  loadingRegencies: boolean;
  onSubmit: () => void;
}

function ArticleListSearchPanel({
  filters,
  setFilters,
  provinces,
  regencies,
  loadingProvinces,
  loadingRegencies,
  onSubmit,
}: ArticleListSearchPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [showProvinceMenu, setShowProvinceMenu] = useState(false);
  const [showRegencyMenu, setShowRegencyMenu] = useState(false);
  const [highlightedProvinceIndex, setHighlightedProvinceIndex] = useState(-1);
  const [highlightedRegencyIndex, setHighlightedRegencyIndex] = useState(-1);

  const provinceSuggestions = useMemo(() => {
    const term = normalizeText(filters.provinceQuery);
    if (!term) return provinces;
    return provinces.filter((option) =>
      normalizeText(option.label).includes(term),
    );
  }, [filters.provinceQuery, provinces]);

  const regencySuggestions = useMemo(() => {
    const term = normalizeText(filters.regencyQuery);
    if (!term) return regencies;
    return regencies.filter((option) =>
      normalizeText(option.label).includes(term),
    );
  }, [filters.regencyQuery, regencies]);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) {
        setShowProvinceMenu(false);
        setShowRegencyMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdvancedToggle = () => {
    setFilters((current) => ({
      ...current,
      isAdvancedOpen: !current.isAdvancedOpen,
    }));
    setShowProvinceMenu(false);
    setShowRegencyMenu(false);
  };

  const handleLokasiToggle = () => {
    setFilters((current) => {
      const nextEnabled = !current.lokasiEnabled;
      return {
        ...current,
        lokasiEnabled: nextEnabled,
        provinceQuery: nextEnabled ? current.provinceQuery : "",
        selectedProvince: nextEnabled ? current.selectedProvince : "",
        regencyQuery: nextEnabled ? current.regencyQuery : "",
        selectedRegency: nextEnabled ? current.selectedRegency : "",
      };
    });
    setShowProvinceMenu(false);
    setShowRegencyMenu(false);
  };

  const handleJenisKonflikToggle = () => {
    setFilters((current) => ({
      ...current,
      jenisKonflikEnabled: !current.jenisKonflikEnabled,
      selectedConflictTypes: !current.jenisKonflikEnabled
        ? current.selectedConflictTypes
        : [],
    }));
  };

  const selectProvince = (option: LocationOption) => {
    setFilters((current) => ({
      ...current,
      provinceQuery: option.label,
      selectedProvince: option.value,
      regencyQuery: "",
      selectedRegency: "",
    }));
    setShowProvinceMenu(false);
    setShowRegencyMenu(false);
  };

  const selectRegency = (option: LocationOption) => {
    setFilters((current) => ({
      ...current,
      regencyQuery: option.label,
      selectedRegency: option.value,
    }));
    setShowRegencyMenu(false);
  };

  const handleProvinceKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!filters.lokasiEnabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowProvinceMenu(true);
      setHighlightedProvinceIndex((current) =>
        Math.min(current + 1, provinceSuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowProvinceMenu(true);
      setHighlightedProvinceIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (showProvinceMenu && activeProvinceIndex >= 0) {
        event.preventDefault();
        selectProvince(provinceSuggestions[activeProvinceIndex]);
        return;
      }
      onSubmit();
      return;
    }

    if (event.key === "Escape") {
      setShowProvinceMenu(false);
      setHighlightedProvinceIndex(-1);
    }
  };

  const handleRegencyKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!filters.lokasiEnabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowRegencyMenu(true);
      setHighlightedRegencyIndex((current) =>
        Math.min(current + 1, regencySuggestions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowRegencyMenu(true);
      setHighlightedRegencyIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (showRegencyMenu && activeRegencyIndex >= 0) {
        event.preventDefault();
        selectRegency(regencySuggestions[activeRegencyIndex]);
        return;
      }
      onSubmit();
      return;
    }

    if (event.key === "Escape") {
      setShowRegencyMenu(false);
      setHighlightedRegencyIndex(-1);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      ref={panelRef}
      className="rounded-2xl border border-[#e6dfc9] bg-[#fffdf8] p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#2d2a26]">
          Temukan Konflik
        </h3>
        <button
          type="button"
          onClick={handleAdvancedToggle}
          className="inline-flex items-center gap-2 rounded-full border border-[#e6dfc9] bg-[#f9f3e7] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b665f] transition hover:border-[#d9cfb3]"
          aria-expanded={filters.isAdvancedOpen}
          aria-controls="article-advanced-search"
        >
          <span>Pencarian Lanjutan</span>
          <ChevronIcon open={filters.isAdvancedOpen} />
        </button>
      </div>

      <div className="mt-4">
        <label
          htmlFor="article-search-input"
          className="mb-2 block text-sm font-semibold text-[#4c4640]"
        >
          Cari Konflik
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-[#e6dfc9] bg-white px-3 py-2">
          <SearchIcon className="h-4 w-4 text-[#9b948c]" />
          <input
            id="article-search-input"
            type="text"
            value={filters.query}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                query: event.target.value,
              }))
            }
            onKeyDown={handleSearchKeyDown}
            placeholder="Ketik kata kunci"
            className="w-full bg-transparent text-sm text-[#2d2a26] outline-none placeholder:text-[#b6afa7]"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() =>
                setFilters((current) => ({ ...current, query: "" }))
              }
              className="rounded-full p-1 text-[#b6afa7] transition hover:text-[#6b665f]"
              aria-label="Hapus kata kunci"
            >
              <ClearIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        id="article-advanced-search"
        className={cn(
          "mt-5 space-y-4",
          filters.isAdvancedOpen ? "block" : "hidden",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#2d2a26]">Lokasi</h4>
            <p className="text-xs text-[#8c857d]">Batasi area konflik</p>
          </div>
          <ToggleSlider enabled={filters.lokasiEnabled} onClick={handleLokasiToggle} />
        </div>

        {filters.lokasiEnabled && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9b948c]">
                Provinsi
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.provinceQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilters((current) => ({
                      ...current,
                      provinceQuery: value,
                      selectedProvince: value ? current.selectedProvince : "",
                      regencyQuery: "",
                      selectedRegency: "",
                    }));
                    setShowProvinceMenu(true);
                  }}
                  onFocus={() => setShowProvinceMenu(true)}
                  onKeyDown={handleProvinceKeyDown}
                  placeholder={loadingProvinces ? "Memuat..." : "Pilih provinsi"}
                  className="w-full rounded-xl border border-[#e6dfc9] bg-white px-3 py-2 text-sm text-[#2d2a26] outline-none placeholder:text-[#b6afa7]"
                />
                {showProvinceMenu && provinceSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-[#e6dfc9] bg-white shadow-lg">
                    {provinceSuggestions.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectProvince(option)}
                        className={cn(
                          "block w-full px-3 py-2 text-left text-sm text-[#2d2a26] hover:bg-[#f8f1e3]",
                          activeProvinceIndex === index && "bg-[#f8f1e3]",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9b948c]">
                Kabupaten / Kota
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.regencyQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setFilters((current) => ({
                      ...current,
                      regencyQuery: value,
                      selectedRegency: value ? current.selectedRegency : "",
                    }));
                    setShowRegencyMenu(true);
                  }}
                  onFocus={() => setShowRegencyMenu(true)}
                  onKeyDown={handleRegencyKeyDown}
                  placeholder={
                    loadingRegencies
                      ? "Memuat..."
                      : filters.selectedProvince
                      ? "Pilih kabupaten/kota"
                      : "Pilih provinsi terlebih dahulu"
                  }
                  className="w-full rounded-xl border border-[#e6dfc9] bg-white px-3 py-2 text-sm text-[#2d2a26] outline-none placeholder:text-[#b6afa7]"
                  disabled={!filters.selectedProvince}
                />
                {showRegencyMenu && regencySuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-[#e6dfc9] bg-white shadow-lg">
                    {regencySuggestions.map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => selectRegency(option)}
                        className={cn(
                          "block w-full px-3 py-2 text-left text-sm text-[#2d2a26] hover:bg-[#f8f1e3]",
                          activeRegencyIndex === index && "bg-[#f8f1e3]",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#2d2a26]">
              Jenis Konflik
            </h4>
            <p className="text-xs text-[#8c857d]">Pilih jenis konflik</p>
          </div>
          <ToggleSlider
            enabled={filters.jenisKonflikEnabled}
            onClick={handleJenisKonflikToggle}
          />
        </div>

        {filters.jenisKonflikEnabled && (
          <div className="grid grid-cols-2 gap-2">
            {CONFLICT_OPTIONS.map((option) => {
              const isSelected = filters.selectedConflictTypes.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      selectedConflictTypes: isSelected
                        ? current.selectedConflictTypes.filter(
                            (value) => value !== option.id,
                          )
                        : [...current.selectedConflictTypes, option.id],
                    }))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-[#4c4640] transition",
                    isSelected
                      ? "border-[#fd6932] bg-[#fff0e6] text-[#fd6932]"
                      : "border-[#e6dfc9] bg-white hover:border-[#d9cfb3]",
                  )}
                >
                  <CheckboxIcon checked={isSelected} />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-xl bg-[#fd6932] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
        >
          Temukan
        </button>
      </div>
    </div>
  );
}

interface ArticleListPageProps {
  type: ArticleListType;
}

export default function ArticleListPage({ type }: ArticleListPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const user = useAuthStore((state) => state.user);

  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState<ArticleListFilters>(createDefaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(() =>
    buildAppliedFilters(createDefaultFilters()),
  );

  const [articles, setArticles] = useState<ArticleCardItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [regencies, setRegencies] = useState<LocationOption[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const isFeatureGridPage = type === "kronik" || type === "tilik";
  const meta = TYPE_META[type];

  useEffect(() => {
    const parsed = parseFiltersFromParams(
      new URLSearchParams(searchParams.toString()),
    );
    setFilters((current) => ({
      ...current,
      query: parsed.query,
      category: parsed.category,
      lokasiEnabled: parsed.lokasiEnabled,
      jenisKonflikEnabled: parsed.jenisKonflikEnabled,
      provinceQuery: parsed.selectedProvince,
      selectedProvince: parsed.selectedProvince,
      regencyQuery: parsed.selectedRegency,
      selectedRegency: parsed.selectedRegency,
      selectedConflictTypes: parsed.selectedConflictTypes,
    }));
    const nextApplied: AppliedFilters = {
      query: parsed.query,
      category: parsed.category,
      lokasiEnabled: parsed.lokasiEnabled,
      jenisKonflikEnabled: parsed.jenisKonflikEnabled,
      selectedProvince: parsed.selectedProvince,
      selectedRegency: parsed.selectedRegency,
      selectedConflictTypes: parsed.selectedConflictTypes,
    };
    setAppliedFilters(nextApplied);
  }, [searchKey, searchParams]);

  useEffect(() => {
    if (!filters.lokasiEnabled || provinces.length > 0) return;

    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const response = await fetch(resolveApiUrl("/api/provinces/"));
        const data = await response.json();
        setProvinces(normalizeLocationList(data));
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, [filters.lokasiEnabled, provinces.length]);

  useEffect(() => {
    if (!filters.lokasiEnabled) {
      setRegencies([]);
      return;
    }

    if (!filters.selectedProvince) {
      setRegencies([]);
      return;
    }

    const fetchRegencies = async () => {
      setLoadingRegencies(true);
      try {
        const response = await fetch(
          resolveApiUrl(`/api/regencies/${filters.selectedProvince}/`),
        );
        const data = await response.json();
        setRegencies(normalizeLocationList(data));
      } catch (err) {
        console.error("Failed to fetch regencies:", err);
      } finally {
        setLoadingRegencies(false);
      }
    };

    fetchRegencies();
  }, [filters.lokasiEnabled, filters.selectedProvince]);

  const applyFilters = (nextFilters: ArticleListFilters) => {
    const applied = buildAppliedFilters(nextFilters);
    setFilters(nextFilters);
    setAppliedFilters(applied);

    const params = buildSearchParams(applied);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const appliedKey = useMemo(
    () => JSON.stringify(appliedFilters),
    [appliedFilters],
  );

  const fetchArticles = useCallback(
    async (pageNumber: number, append: boolean) => {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", pageNumber.toString());
        if (appliedFilters.category && appliedFilters.category !== "semua") {
          params.set("category", appliedFilters.category);
        }
        if (appliedFilters.query) params.set("q", appliedFilters.query);
        if (appliedFilters.lokasiEnabled && appliedFilters.selectedProvince) {
          params.set("province", appliedFilters.selectedProvince);
        }
        if (appliedFilters.lokasiEnabled && appliedFilters.selectedRegency) {
          params.set("regency", appliedFilters.selectedRegency);
        }
        if (
          appliedFilters.jenisKonflikEnabled &&
          appliedFilters.selectedConflictTypes.length > 0
        ) {
          params.set(
            "jenis_konflik",
            appliedFilters.selectedConflictTypes.join(","),
          );
        }

        const response = await fetch(
          resolveApiUrl(`/api/article/${type}/?${params.toString()}`),
        );
        if (!response.ok) {
          throw new Error("Gagal memuat artikel.");
        }

        const data = await response.json();
        const results = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.articles)
          ? data.articles
          : [];

        const normalizedResults = results.map((item: ArticleCardItem) => ({
          ...item,
          type: item.type || item.article_type || type,
        }));

        setArticles((current) =>
          append ? [...current, ...normalizedResults] : normalizedResults,
        );
        setTotalCount((current) => {
          if (typeof data?.count === "number") return data.count;
          if (!append) return normalizedResults.length;
          return current + normalizedResults.length;
        });
        const hasNext = Boolean(data?.next || data?.has_next);
        setHasMore(hasNext || normalizedResults.length > 0);
        setPage(pageNumber);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat daftar artikel. Coba lagi nanti.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appliedFilters, type],
  );

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(false);
    fetchArticles(1, false);
  }, [appliedKey, fetchArticles]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        if (loading || loadingMore || !hasMore) return;
        fetchArticles(page + 1, true);
      },
      { rootMargin: "220px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchArticles, hasMore, loading, loadingMore, page]);

  const gridClass = isFeatureGridPage
    ? "grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-6"
    : "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3 xl:gap-6";

  return (
    <div className="min-h-screen bg-[#f7f5ef] lg:h-[calc(100vh-var(--site-top-nav-height-desktop))] lg:min-h-0 lg:overflow-hidden">
      <div className="flex min-h-[calc(100vh-var(--site-top-nav-height-desktop))] flex-col lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
        <aside className="hidden bg-[#faf8f1] transition-[width,padding] duration-200 lg:block lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain">
          <LeftSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </aside>

        <main className="relative z-0 min-w-0 flex-1 overflow-x-hidden bg-[#faf8f1] px-0 pt-5 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pt-6">
          <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-8 lg:px-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#2d2a26]">
                {meta.title}
              </h1>
              <p className="text-sm text-[#6b665f] md:text-base">
                {meta.subtitle}
              </p>
            </div>

            <div className="rounded-xl border border-[#e6dfc9] bg-[#fffdf8] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#9a948c]">
                  Kategori
                </span>
                {CATEGORY_OPTIONS.map((option) => {
                  const isActive = filters.category === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() =>
                        applyFilters({
                          ...filters,
                          category: option.key,
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        isActive
                          ? "border-[#fd6932] bg-[#fff0e6] text-[#fd6932]"
                          : "border-transparent bg-[#f6f0e4] text-[#555333] hover:border-[#e6dfc9]",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {appliedFilters.category !== "semua" && (
              <div className="rounded-xl border border-[#f2d3bd] bg-[#fff3ea] px-4 py-2 text-sm text-[#8a4b2e]">
                Menampilkan kategori <span className="font-semibold">{getCategoryLabel(appliedFilters.category)}</span>
              </div>
            )}

            {totalCount > 0 && (
              <div className="text-sm text-[#9a948c]">
                {totalCount} artikel ditemukan
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-[#f2d3bd] bg-[#fff3ea] px-4 py-3 text-sm text-[#8a4b2e]">
                {error}
              </div>
            )}

            {loading && articles.length === 0 ? (
              <div className={gridClass}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    heightClassName="h-40"
                    className="rounded-2xl"
                  />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl border border-[#e6dfc9] bg-[#fffdf8] px-4 py-6 text-center text-sm text-[#6b665f]">
                Belum ada artikel yang cocok dengan filter ini.
              </div>
            ) : (
              <div className={gridClass}>
                {articles.map((article) => (
                  <ArticleCardGrid
                    key={`${article.id}-${article.slug}`}
                    article={article}
                    isHomepage={false}
                  />
                ))}
              </div>
            )}

            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-[#8d847b]">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#d9cfb3] border-t-transparent" />
                  Memuat artikel...
                </div>
              </div>
            )}

            {!loading && !loadingMore && articles.length > 0 && !hasMore && (
              <div className="py-4 text-center text-sm text-[#8d847b]">
                Kamu sudah di akhir daftar.
              </div>
            )}

            <div ref={sentinelRef} className="h-8" />
          </div>

          {user && isFeatureGridPage && (
            <Link
              href={`/urun-daya/${type}`}
              className="fixed bottom-24 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#fd6932] text-white shadow-lg transition hover:brightness-95 lg:bottom-10 lg:right-10"
              aria-label="Tambah artikel"
            >
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </Link>
          )}
        </main>

        <aside className="hidden w-[360px] shrink-0 border-l border-[#e6dfc9] bg-[#faf8f1] lg:block lg:h-full lg:overflow-y-auto">
          <div className="px-4 py-5">
            <ArticleListSearchPanel
              filters={filters}
              setFilters={setFilters}
              provinces={provinces}
              regencies={regencies}
              loadingProvinces={loadingProvinces}
              loadingRegencies={loadingRegencies}
              onSubmit={() => applyFilters(filters)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 transition", open ? "rotate-180" : "")}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ToggleSlider({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative h-7 w-12 rounded-full border transition",
        enabled
          ? "border-[#fd6932] bg-[#fd6932]"
          : "border-[#d7ccb5] bg-[#efe7d7]",
      )}
      aria-pressed={enabled}
    >
      <span
        className={cn(
          "absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition",
          enabled ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border",
        checked
          ? "border-[#fd6932] bg-[#fd6932]"
          : "border-[#c9c1b0] bg-white",
      )}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
  );
}
