import type { ArticleCardItem } from "@/features/article/types";

export type MarkerCategory =
	| "AGRARIA"
	| "EKOSOSPOL"
	| "SUMBER_DAYA_ALAM"
	| string;

export interface MapMarker {
	id?: number | string;
	name?: string;
	article_title?: string;
	category: MarkerCategory;
	coords: [number, number] | [string, string] | string[];
}

export interface KredoData {
	heading?: string;
	lead?: string;
	body?: string;
}

export interface LocationOption {
	label: string;
	value: string;
}

export interface HomepageConflictOption {
	id: string;
	label: string;
}

export type HomepageAreaKey = "kronik" | "tilik" | "diskursus" | "tanggapan";

export type HomepageSearchResults = Record<HomepageAreaKey, ArticleCardItem[]>;

export interface HomepageSearchState {
	query: string;
	isAdvancedOpen: boolean;
	lokasiEnabled: boolean;
	jenisKonflikEnabled: boolean;
	provinceQuery: string;
	selectedProvince: string;
	regencyQuery: string;
	selectedRegency: string;
	selectedConflictTypes: string[];
	selectedAreas: Record<HomepageAreaKey, boolean>;
	hasSubmittedSearch: boolean;
	isSearching: boolean;
	searchResultsByType: HomepageSearchResults;
}

export interface HomepageSearchController {
	state: HomepageSearchState;
	errorMessage: string | null;
	clearError: () => void;
	conflictOptions: HomepageConflictOption[];
	isLoadingProvinces: boolean;
	isLoadingRegencies: boolean;
	provinceSuggestions: LocationOption[];
	regencySuggestions: LocationOption[];
	onQueryChange: (value: string) => void;
	onQueryClear: () => void;
	onAdvancedToggle: () => void;
	onLokasiToggle: () => void;
	onJenisKonflikToggle: () => void;
	onProvinceQueryChange: (value: string) => void;
	onProvinceSelect: (option: LocationOption) => void;
	onProvinceClear: () => void;
	onRegencyQueryChange: (value: string) => void;
	onRegencySelect: (option: LocationOption) => void;
	onRegencyClear: () => void;
	onConflictToggle: (typeId: string) => void;
	onAreaToggle: (areaKey: HomepageAreaKey) => void;
	onSubmit: () => Promise<void>;
}

export interface HomepageSearchOptions {
	enabled?: boolean;
}
