"use client";

import { useEffect, useMemo, useState } from "react";
import { parseJsonResponse, resolveApiUrl } from "@/lib/api";
import type { ArticleCardItem } from "@/features/article/types";
import type {
	HomepageAreaKey,
	HomepageConflictOption,
	HomepageSearchController,
	HomepageSearchOptions,
	HomepageSearchResults,
	HomepageSearchState,
	LocationOption,
} from "../types";

export const HOMEPAGE_CONFLICT_OPTIONS: HomepageConflictOption[] = [
	{ id: "sda", label: "Pemanfaatan SDA" },
	{ id: "agraria", label: "Agraria/pemanfaatan lahan" },
	{ id: "ekonomi", label: "Ekonomi, sosial, politik, SARA" },
];

export const HOMEPAGE_AREA_ORDER: HomepageAreaKey[] = [
	"kronik",
	"tilik",
	"diskursus",
	"tanggapan",
];

export const createEmptySearchResults = (): HomepageSearchResults => ({
	kronik: [],
	tilik: [],
	diskursus: [],
	tanggapan: [],
});

const normalizeLocationList = (payload: unknown): unknown[] => {
	if (Array.isArray(payload)) return payload;
	if (payload && typeof payload === "object") {
		const record = payload as Record<string, unknown>;
		if (Array.isArray(record.results)) return record.results;
		if (Array.isArray(record.data)) return record.data;
		if (Array.isArray(record.items)) return record.items;
		if (Array.isArray(record.provinces)) return record.provinces;
		if (Array.isArray(record.regencies)) return record.regencies;
		const firstArrayValue = Object.values(record).find((value) =>
			Array.isArray(value),
		);
		if (Array.isArray(firstArrayValue)) return firstArrayValue;
	}
	return [];
};

const normalizeLocationOptions = (payload: unknown): LocationOption[] =>
	normalizeLocationList(payload)
		.map((item) => {
			if (!item || typeof item !== "object") return null;
			const record = item as Record<string, unknown>;
			const rawLabel =
				record.name ||
				record.province_name ||
				record.regency_name ||
				record.title ||
				record.code ||
				record.id ||
				"";
			const label = typeof rawLabel === "string" ? rawLabel : String(rawLabel);

			return label ? { label, value: label } : null;
		})
		.filter(Boolean) as LocationOption[];

const normalizeText = (value: unknown): string => {
	if (!value) return "";
	if (typeof value === "string") return value.trim().toLowerCase();
	if (Array.isArray(value)) {
		return value.map(normalizeText).find(Boolean) || "";
	}
	if (typeof value === "object") {
		const record = value as Record<string, unknown>;
		return (
			normalizeText(record.label) ||
			normalizeText(record.name) ||
			normalizeText(record.title) ||
			normalizeText(record.value) ||
			""
		);
	}
	return String(value).trim().toLowerCase();
};

const collectArticleSearchText = (article: ArticleCardItem) =>
	[
		article?.title,
		article?.lead_excerpt,
		article?.excerpt,
		article?.summary,
		article?.content,
	]
		.map(normalizeText)
		.filter(Boolean)
		.join(" ");

const collectArticleLocationText = (article: ArticleCardItem) =>
	[
		(article as Record<string, unknown>)?.province,
		(article as Record<string, unknown>)?.province_name,
		(article as Record<string, unknown>)?.regency,
		(article as Record<string, unknown>)?.regency_name,
		(article as Record<string, unknown>)?.city,
		(article as Record<string, unknown>)?.city_name,
		(article as Record<string, unknown>)?.location_name,
		(article as Record<string, unknown>)?.location_label,
		article?.location_geojson?.properties?.province,
		article?.location_geojson?.properties?.provinsi,
		article?.location_geojson?.properties?.regency,
		article?.location_geojson?.properties?.kabupaten,
		article?.location_geojson?.properties?.city,
		article?.location_geojson?.properties?.name,
	]
		.map(normalizeText)
		.filter(Boolean)
		.join(" ");

const collectArticleConflictText = (article: ArticleCardItem) =>
	[
		(article as Record<string, unknown>)?.category,
		(article as Record<string, unknown>)?.category_label,
		(article as Record<string, unknown>)?.category_name,
		(article as Record<string, unknown>)?.conflict_category,
		(article as Record<string, unknown>)?.jenis_konflik,
	]
		.map(normalizeText)
		.filter(Boolean)
		.join(" ");

const conflictKeywordsById: Record<string, string[]> = {
	sda: ["sda", "sumber daya alam", "pemanfaatan sda", "ekstraktif"],
	agraria: ["agraria", "pemanfaatan lahan"],
	ekonomi: ["ekonomi", "sosial", "politik", "sara", "ekosospol"],
};

const matchesArticleSearchState = (
	article: ArticleCardItem,
	searchState: HomepageSearchState,
) => {
	const query = normalizeText(searchState.query);
	const province = normalizeText(searchState.selectedProvince);
	const regency = normalizeText(searchState.selectedRegency);
	const searchText = collectArticleSearchText(article);
	const locationText = collectArticleLocationText(article);
	const conflictText = collectArticleConflictText(article);

	if (query && !searchText.includes(query)) return false;

	if (searchState.lokasiEnabled) {
		if (province && !locationText.includes(province)) return false;
		if (regency && !locationText.includes(regency)) return false;
	}

	if (
		searchState.jenisKonflikEnabled &&
		searchState.selectedConflictTypes.length > 0
	) {
		const matchesConflict = searchState.selectedConflictTypes.some((typeId) =>
			(conflictKeywordsById[typeId] || []).some((keyword) =>
				conflictText.includes(keyword),
			),
		);

		if (!matchesConflict) return false;
	}

	return true;
};

const toResultArticle = (article: ArticleCardItem, type: HomepageAreaKey) => ({
	...article,
	type: article?.type || article?.article_type || type,
});

const buildHomepageSearchParams = (searchState: HomepageSearchState) => {
	const params = new URLSearchParams();

	if (searchState.query) params.set("q", searchState.query);
	if (searchState.lokasiEnabled && searchState.selectedProvince) {
		params.set("province", searchState.selectedProvince);
	}
	if (searchState.lokasiEnabled && searchState.selectedRegency) {
		params.set("regency", searchState.selectedRegency);
	}
	if (
		searchState.jenisKonflikEnabled &&
		searchState.selectedConflictTypes.length > 0
	) {
		params.set("jenis_konflik", searchState.selectedConflictTypes.join(","));
	}

	return params;
};

export default function useHomepageSearch(
	options: HomepageSearchOptions = {},
): HomepageSearchController {
	const { enabled = true } = options;
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [state, setState] = useState<HomepageSearchState>({
		query: "",
		isAdvancedOpen: true,
		lokasiEnabled: false,
		jenisKonflikEnabled: false,
		provinceQuery: "",
		selectedProvince: "",
		regencyQuery: "",
		selectedRegency: "",
		selectedConflictTypes: [],
		selectedAreas: {
			kronik: true,
			tilik: true,
			diskursus: true,
			tanggapan: true,
		},
		hasSubmittedSearch: false,
		isSearching: false,
		searchResultsByType: createEmptySearchResults(),
	});
	const [provinces, setProvinces] = useState<LocationOption[]>([]);
	const [regencies, setRegencies] = useState<LocationOption[]>([]);
	const [loadingState, setLoadingState] = useState({
		provinces: false,
		regencies: false,
	});

	useEffect(() => {
		if (!enabled || provinces.length > 0) return;

		let ignore = false;

		const fetchProvinces = async () => {
			setLoadingState((prev) => ({ ...prev, provinces: true }));

			try {
				let response = await fetch(resolveApiUrl("/api/locations/provinces/"));
				if (!response.ok) {
					response = await fetch(resolveApiUrl("/api/locations/provinces"));
				}
				if (!response.ok) return;

				const data = await parseJsonResponse<unknown>(response);
				if (!ignore) {
					setProvinces(normalizeLocationOptions(data));
				}
			} catch (error) {
				console.error("Failed to load homepage provinces", error);
			} finally {
				if (!ignore) {
					setLoadingState((prev) => ({ ...prev, provinces: false }));
				}
			}
		};

		fetchProvinces();

		return () => {
			ignore = true;
		};
	}, [enabled, provinces.length]);

	useEffect(() => {
		if (!enabled || !state.lokasiEnabled || !state.selectedProvince) {
			setRegencies([]);
			setLoadingState((prev) => ({ ...prev, regencies: false }));
			return;
		}

		let ignore = false;

		const fetchRegencies = async () => {
			setLoadingState((prev) => ({ ...prev, regencies: true }));

			try {
				const provinceValue = encodeURIComponent(state.selectedProvince);

				let response = await fetch(
					resolveApiUrl(
						`/api/locations/regencies/?province=${provinceValue}`,
					),
				);

				if (!response.ok) {
					response = await fetch(
						resolveApiUrl(
							`/api/locations/regencies/?province_id=${provinceValue}`,
						),
					);
				}

				if (!response.ok) {
					response = await fetch(
						resolveApiUrl(
							`/api/locations/regencies/?province_code=${provinceValue}`,
						),
					);
				}

				if (!response.ok) return;

				const data = await parseJsonResponse<unknown>(response);
				if (!ignore) {
					setRegencies(normalizeLocationOptions(data));
				}
			} catch (error) {
				console.error("Failed to load homepage regencies", error);
			} finally {
				if (!ignore) {
					setLoadingState((prev) => ({ ...prev, regencies: false }));
				}
			}
		};

		fetchRegencies();

		return () => {
			ignore = true;
		};
	}, [enabled, state.lokasiEnabled, state.selectedProvince]);

	const provinceSuggestions = useMemo(
		() =>
			provinces.filter((option) =>
				normalizeText(option.label).includes(
					normalizeText(state.provinceQuery),
				),
			),
		[provinces, state.provinceQuery],
	);

	const regencySuggestions = useMemo(
		() =>
			regencies.filter((option) =>
				normalizeText(option.label).includes(normalizeText(state.regencyQuery)),
			),
		[regencies, state.regencyQuery],
	);

	const updateState = (
		updater:
			| ((prev: HomepageSearchState) => HomepageSearchState)
			| Partial<HomepageSearchState>,
	) => {
		setState((prev) =>
			typeof updater === "function" ? updater(prev) : { ...prev, ...updater },
		);
	};

	const fetchHomepageTypeResults = async (
		type: HomepageAreaKey,
		searchState: HomepageSearchState,
	) => {
		if (type === "tanggapan") return [];

		const params = buildHomepageSearchParams(searchState);
		params.set("page", "1");
		params.set("page_size", "12");

		const response = await fetch(
			resolveApiUrl(`/api/article/${type}/?${params.toString()}`),
		);

		if (!response.ok) {
			throw new Error(`Failed to load ${type} results`);
		}

		const data = await parseJsonResponse<{
			results?: ArticleCardItem[];
			articles?: ArticleCardItem[];
		}>(response);
		const results = (data.results || data.articles || []) as ArticleCardItem[];

		return results
			.filter((article) => matchesArticleSearchState(article, searchState))
			.map((article) => toResultArticle(article, type));
	};

	const onSubmit = async () => {
		const nextState = {
			...state,
			hasSubmittedSearch: true,
			isSearching: true,
		};

		setState((prev) => ({
			...prev,
			hasSubmittedSearch: true,
			isSearching: true,
			searchResultsByType: createEmptySearchResults(),
		}));

		const activeAreas = HOMEPAGE_AREA_ORDER.filter(
			(areaKey) => state.selectedAreas[areaKey],
		);

		if (activeAreas.length === 0) {
			setState((prev) => ({
				...prev,
				hasSubmittedSearch: true,
				isSearching: false,
				searchResultsByType: createEmptySearchResults(),
			}));
			return;
		}

		try {
			const resultEntries = await Promise.all(
				activeAreas.map(async (type) => [
					type,
					await fetchHomepageTypeResults(type, nextState),
				]),
			);

			const nextResults = createEmptySearchResults();
			resultEntries.forEach(([type, results]) => {
				nextResults[type as HomepageAreaKey] = results as ArticleCardItem[];
			});

			setErrorMessage(null);
			setState((prev) => ({
				...prev,
				hasSubmittedSearch: true,
				isSearching: false,
				searchResultsByType: nextResults,
			}));
		} catch (error) {
			console.error("Failed to run homepage search", error);
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Failed to run homepage search.",
			);
			setState((prev) => ({
				...prev,
				hasSubmittedSearch: true,
				isSearching: false,
				searchResultsByType: createEmptySearchResults(),
			}));
		}
	};

	return {
		state,
		errorMessage,
		clearError: () => setErrorMessage(null),
		conflictOptions: HOMEPAGE_CONFLICT_OPTIONS,
		isLoadingProvinces: loadingState.provinces,
		isLoadingRegencies: loadingState.regencies,
		provinceSuggestions,
		regencySuggestions,
		onQueryChange: (value) => updateState({ query: value }),
		onQueryClear: () => updateState({ query: "" }),
		onAdvancedToggle: () =>
			updateState((prev) => ({
				...prev,
				isAdvancedOpen: !prev.isAdvancedOpen,
			})),
		onLokasiToggle: () =>
			updateState((prev) => ({
				...prev,
				lokasiEnabled: !prev.lokasiEnabled,
				provinceQuery: prev.lokasiEnabled ? "" : prev.provinceQuery,
				selectedProvince: prev.lokasiEnabled ? "" : prev.selectedProvince,
				regencyQuery: prev.lokasiEnabled ? "" : prev.regencyQuery,
				selectedRegency: prev.lokasiEnabled ? "" : prev.selectedRegency,
			})),
		onJenisKonflikToggle: () =>
			updateState((prev) => ({
				...prev,
				jenisKonflikEnabled: !prev.jenisKonflikEnabled,
				selectedConflictTypes: prev.jenisKonflikEnabled
					? []
					: prev.selectedConflictTypes,
			})),
		onProvinceQueryChange: (value) =>
			updateState((prev) => ({
				...prev,
				provinceQuery: value,
				selectedProvince:
					normalizeText(value) === normalizeText(prev.selectedProvince)
						? prev.selectedProvince
						: "",
				regencyQuery: "",
				selectedRegency: "",
			})),
		onProvinceSelect: (option) =>
			updateState((prev) => ({
				...prev,
				provinceQuery: option.label,
				selectedProvince: option.value,
				regencyQuery: "",
				selectedRegency: "",
			})),
		onProvinceClear: () =>
			updateState((prev) => ({
				...prev,
				provinceQuery: "",
				selectedProvince: "",
				regencyQuery: "",
				selectedRegency: "",
			})),
		onRegencyQueryChange: (value) =>
			updateState((prev) => ({
				...prev,
				regencyQuery: value,
				selectedRegency:
					normalizeText(value) === normalizeText(prev.selectedRegency)
						? prev.selectedRegency
						: "",
			})),
		onRegencySelect: (option) =>
			updateState((prev) => ({
				...prev,
				regencyQuery: option.label,
				selectedRegency: option.value,
			})),
		onRegencyClear: () =>
			updateState((prev) => ({
				...prev,
				regencyQuery: "",
				selectedRegency: "",
			})),
		onConflictToggle: (typeId) =>
			updateState((prev) => ({
				...prev,
				selectedConflictTypes: prev.selectedConflictTypes.includes(typeId)
					? prev.selectedConflictTypes.filter((value) => value !== typeId)
					: [...prev.selectedConflictTypes, typeId],
			})),
		onAreaToggle: (areaKey) =>
			updateState((prev) => ({
				...prev,
				selectedAreas: {
					...prev.selectedAreas,
					[areaKey]: !prev.selectedAreas[areaKey],
				},
			})),
		onSubmit,
	};
}
