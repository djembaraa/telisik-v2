import { parseJsonResponse, resolveApiUrl } from "@/lib/api";
import type { ArticleCardItem } from "@/features/article/types";
import type { KredoData, MapMarker } from "../types";

const fetchJson = async <T>(path: string): Promise<T> => {
	const response = await fetch(resolveApiUrl(path));
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`);
	}
	return parseJsonResponse<T>(response);
};

export const fetchHomepageMarkers = async (): Promise<MapMarker[]> => {
	const data = await fetchJson<{ markers?: MapMarker[] }>("/api/homepage/");
	return data.markers ?? [];
};

export const fetchKredo = async (): Promise<KredoData> => {
	const data = await fetchJson<KredoData>("/api/kredo/");
	return data ?? {};
};

export const fetchDiskursus = async (
	pageSize = 12,
): Promise<ArticleCardItem[]> => {
	const params = new URLSearchParams({
		page: "1",
		page_size: String(pageSize),
	});
	const data = await fetchJson<{ results?: ArticleCardItem[] }>(
		`/api/article/diskursus/?${params.toString()}`,
	);
	return data.results ?? [];
};
