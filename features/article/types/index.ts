export interface ArticleCardItem {
	id?: number | string;
	slug: string;
	title: string;
	type?: string;
	article_type?: string;
	lead_excerpt?: string;
	excerpt?: string;
	summary?: string;
	content?: string;
	featured_image?: string;
	cover?: string;
	location_geojson?: {
		properties?: {
			city?: string;
			name?: string;
			province?: string;
			provinsi?: string;
			regency?: string;
			kabupaten?: string;
		};
	};
	[key: string]: unknown;
}
