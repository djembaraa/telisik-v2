"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import type { ArticleCardItem } from "../types";

export interface ArticleCardGridProps {
	article: ArticleCardItem;
	variant?: "default" | "home";
}

const resolveImageUrl = (imageSource: string, mediaBase: string) => {
	if (!imageSource) return "";
	if (imageSource.startsWith("/static/")) return `${mediaBase}${imageSource}`;
	if (imageSource.startsWith("static/")) return `${mediaBase}/${imageSource}`;
	return imageSource;
};

export default function ArticleCardGrid({
	article,
	variant = "default",
}: ArticleCardGridProps) {
	const mediaBase = API_BASE || "https://api.telisik.org";
	const isHomeVariant = variant === "home";
	const articleType = (article.type || article.article_type || "diskursus").toLowerCase();
	const articleUrl = `/article/${articleType}/${article.slug}`;

	const imageSource = article.featured_image || article.cover || "";
	const imageUrl = resolveImageUrl(imageSource, mediaBase);
	const [showImage, setShowImage] = useState(Boolean(imageUrl));

	useEffect(() => {
		setShowImage(Boolean(imageUrl));
	}, [imageUrl, article.slug]);

	const excerptTextRaw = article.lead_excerpt || article.excerpt || "";
	const excerptText =
		excerptTextRaw.length > 155
			? `${excerptTextRaw.substring(0, 155)}...`
			: excerptTextRaw;

	return (
		<article className="w-full overflow-hidden bg-transparent">
			{showImage && imageUrl ? (
				<Link href={articleUrl} className="block">
					<img
						src={imageUrl}
						alt={article.title}
						className="aspect-[4/3] w-full object-cover"
						loading="lazy"
						decoding="async"
						onError={() => setShowImage(false)}
					/>
				</Link>
			) : (
				<div
					className="aspect-[4/3] w-full"
					style={{
						background:
							"linear-gradient(145deg, var(--feed-card-placeholder-start) 0%, var(--feed-card-placeholder-end) 100%)",
					}}
					aria-hidden="true"
				/>
			)}

			<div className={isHomeVariant ? "pt-2" : "pt-2"}>
				<h3
					className={
						isHomeVariant
							? "mb-1 text-left text-sm font-bold leading-snug text-[#fc6736]"
							: "mb-0 mt-2 text-left text-lg font-semibold leading-tight text-[#fc6736]"
					}
				>
					<Link
						href={articleUrl}
						className={
							isHomeVariant
								? "block w-full transition-opacity hover:opacity-90"
								: "block w-full transition-colors hover:text-[#dc5b2b]"
						}
					>
						{article.title}
					</Link>
				</h3>

				{excerptText ? (
					<p
						className={
							isHomeVariant
								? "text-xs leading-relaxed text-gray-600 line-clamp-3"
								: "text-sm leading-relaxed text-gray-600 line-clamp-3"
						}
					>
						{excerptText}
					</p>
				) : null}
			</div>
		</article>
	);
}
