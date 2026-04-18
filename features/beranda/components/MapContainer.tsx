"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MapMarker, MarkerCategory } from "../types";

export interface MapContainerProps {
	markers?: MapMarker[];
	activeCategories?: Set<MarkerCategory>;
	onCategoryToggle?: (category: MarkerCategory) => void;
	className?: string;
	stageClassName?: string;
	legendClassName?: string;
}

const categoryColors: Record<MarkerCategory, string> = {
	AGRARIA: "#D84315",
	EKOSOSPOL: "#1976D2",
	SUMBER_DAYA_ALAM: "#388E3C",
};

const mapInfoText =
	"Konflik sosial, yang selanjutnya disebut Konflik, adalah perseteruan dan/atau benturan fisik dengan kekerasan antara dua kelompok masyarakat atau lebih yang berlangsung dalam waktu tertentu dan berdampak luas yang mengakibatkan ketidakamanan dan disintegrasi sosial sehingga mengganggu stabilitas nasional dan menghambat pembangunan nasional. (UU No. 7/2012 tentang Penanganan Konflik Sosial)";

export default function MapContainer({
	markers = [],
	activeCategories,
	onCategoryToggle,
	className = "",
	stageClassName = "",
	legendClassName = "",
}: MapContainerProps) {
	const mapRef = useRef<HTMLDivElement | null>(null);
	const mapInstance = useRef<any>(null);
	const observerRef = useRef<MutationObserver | null>(null);
	const mapSectionRef = useRef<HTMLDivElement | null>(null);
	const [mapReady, setMapReady] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const customMarkersRef = useRef<SVGCircleElement[]>([]);
	const fallbackCategories = useRef(new Set<MarkerCategory>());
	const activeCategorySet = activeCategories ?? fallbackCategories.current;

	const updateCustomMarkers = useCallback(() => {
		const map = mapInstance.current;
		if (!map || !mapReady) return;

		customMarkersRef.current.forEach((circle) => {
			const lat = parseFloat(circle.getAttribute("data-lat") || "0");
			const lng = parseFloat(circle.getAttribute("data-lng") || "0");
			const point = map.coordsToPoint(lat, lng);

			circle.setAttribute("cx", String(point.x));
			circle.setAttribute("cy", String(point.y));
		});
	}, [mapReady]);

	const renderCustomMarkers = useCallback(() => {
		const map = mapInstance.current;
		if (!map || !mapReady) return;

		customMarkersRef.current.forEach((el) => el.remove());
		customMarkersRef.current = [];

		if (activeCategorySet.size === 0 || markers.length === 0) return;

		const filtered = markers.filter((m) => activeCategorySet.has(m.category));
		const svg = map.container?.querySelector?.("svg");
		if (!svg) return;

		filtered.forEach((marker) => {
			const coords = [
				parseFloat(String(marker.coords[0])),
				parseFloat(String(marker.coords[1])),
			];
			const point = map.coordsToPoint(coords[0], coords[1]);

			const circle = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"circle",
			);
			circle.setAttribute("cx", String(point.x));
			circle.setAttribute("cy", String(point.y));
			circle.setAttribute("r", "7");
			circle.setAttribute("fill", categoryColors[marker.category] || "#666");
			circle.setAttribute("stroke", "white");
			circle.setAttribute("strokeWidth", "1.5");
			circle.setAttribute(
				"class",
				"cursor-pointer transition-opacity hover:opacity-80",
			);
			circle.setAttribute("data-lat", String(coords[0]));
			circle.setAttribute("data-lng", String(coords[1]));

			const title = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"title",
			);
			title.textContent = `${marker.name || ""} (${marker.article_title || ""})`;
			circle.appendChild(title);

			svg.appendChild(circle);
			customMarkersRef.current.push(circle);
		});
	}, [markers, activeCategorySet, mapReady]);

	useEffect(() => {
		if (typeof window === "undefined") return undefined;
		let mounted = true;

		const ensureMapData = () =>
			new Promise<void>((resolve, reject) => {
				if ((window as any).jsVectorMap?.maps?.indonesia) {
					resolve();
					return;
				}

				const existingScript = document.querySelector(
					"script[data-jsvectormap-map='indonesia']",
				) as HTMLScriptElement | null;
				if (existingScript) {
					existingScript.addEventListener("load", () => resolve());
					existingScript.addEventListener("error", () =>
						reject(new Error("Failed to load map data")),
					);
					return;
				}

				const script = document.createElement("script");
				script.src = "/maps/jsvectormap.indonesia.js";
				script.async = true;
				script.dataset.jsvectormapMap = "indonesia";
				script.onload = () => resolve();
				script.onerror = () =>
					reject(new Error("Failed to load map data"));
				document.body.appendChild(script);
			});

		const createMap = async () => {
			if (!mapRef.current || mapInstance.current) return;
			mapRef.current.innerHTML = "";

			const module = await import("jsvectormap");
			if (!mounted) return;
			await ensureMapData();
			if (!mounted) return;

			const mapConfig = {
				selector: mapRef.current,
				map: "indonesia",
				backgroundColor: "transparent",
				regionStyle: {
					initial: {
						fill: "#D8D4C9",
						stroke: "#dadce0",
						strokeWidth: 0.5,
					},
				},
				zoomOnScroll: false,
				zoomButtons: false,
				draggable: true,
				markers: [],
			};

			mapInstance.current = new module.default(mapConfig);
			const map = mapInstance.current;

			const svg = map.container?.querySelector?.("svg");
			if (svg) {
				try {
					svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
					svg.setAttribute("width", "100%");
					svg.setAttribute("height", "100%");
					svg.style.display = "block";
				} catch {
					// no-op
				}

				const observer = new MutationObserver(() => {
					updateCustomMarkers();
				});

				const g = svg.querySelector("g");
				if (g) {
					observer.observe(g, {
						attributes: true,
						attributeFilter: ["transform"],
					});
					observerRef.current = observer;
				}
			}

			setMapReady(true);
		};

		void createMap();

		return () => {
			mounted = false;
			customMarkersRef.current.forEach((el) => {
				try {
					el.remove();
				} catch {
					// no-op
				}
			});
			customMarkersRef.current = [];

			if (observerRef.current) {
				try {
					observerRef.current.disconnect();
				} catch {
					// no-op
				}
				observerRef.current = null;
			}

			if (mapInstance.current) {
				mapInstance.current = null;
			}

			if (mapRef.current) {
				mapRef.current.innerHTML = "";
			}
		};
	}, [updateCustomMarkers]);

	useEffect(() => {
		if (mapInstance.current && mapReady) {
			const timer = setTimeout(() => {
				mapInstance.current.updateSize();
				setTimeout(() => {
					renderCustomMarkers();
				}, 100);
			}, 100);
			return () => clearTimeout(timer);
		}
		return undefined;
	}, [isFullscreen, mapReady, renderCustomMarkers]);

	useEffect(() => {
		if (mapReady && mapInstance.current) {
			const targetColor = activeCategorySet.size > 0 ? "#c8c4b7" : "#D8D4C9";
			if (mapInstance.current.regions) {
				Object.keys(mapInstance.current.regions).forEach((code) => {
					const region = mapInstance.current.regions[code];
					if (region?.element?.node) {
						region.element.node.style.fill = targetColor;
					}
				});
			}
			renderCustomMarkers();
		}
	}, [mapReady, activeCategorySet, renderCustomMarkers]);

	const handleFullscreen = () => {
		const container = mapSectionRef.current;
		if (!container) return;

		if (!document.fullscreenElement) {
			if (container.requestFullscreen) container.requestFullscreen();
			else if ((container as any).webkitRequestFullscreen)
				(container as any).webkitRequestFullscreen();
		} else {
			void document.exitFullscreen();
		}
	};

	useEffect(() => {
		const handler = () => {
			const isNowFullscreen = !!document.fullscreenElement;
			setIsFullscreen(isNowFullscreen);

			if (mapInstance.current) {
				setTimeout(() => {
					mapInstance.current.updateSize();
					setTimeout(() => {
						renderCustomMarkers();
					}, 150);
				}, 150);
			}
		};

		document.addEventListener("fullscreenchange", handler);
		document.addEventListener("webkitfullscreenchange", handler);

		return () => {
			document.removeEventListener("fullscreenchange", handler);
			document.removeEventListener("webkitfullscreenchange", handler);
		};
	}, [renderCustomMarkers]);

	const handleZoom = (zoomIn = true) => () => {
		const map = mapInstance.current;
		if (!map || !map._setScale) return;

		map._setScale(
			zoomIn ? map.scale * map.params.zoomStep : map.scale / map.params.zoomStep,
			map._width / 2,
			map._height / 2,
			false,
			map.params.zoomAnimate,
		);
	};

	return (
		<div
			ref={mapSectionRef}
			className={`w-full overflow-hidden rounded-sm bg-[#F0FDFF] shadow-[0_2px_8px_rgba(30,41,59,0.06)] ${
				isFullscreen
					? "fixed inset-0 z-50 flex h-full w-full flex-col rounded-none border-none"
					: "flex flex-col"
			} ${className}`}
		>
			<div
				className={`w-full ${isFullscreen ? "flex min-h-0 flex-1" : ""}`}
			>
				<div
					className={`relative w-full bg-[#F0FDFF] ${
						isFullscreen
							? "min-h-0 flex-1"
							: "aspect-[4/3] md:aspect-[21/9]"
					} ${stageClassName}`}
				>
					<div ref={mapRef} className="h-full w-full" />

					<div className="absolute right-2 top-2 z-10 inline-flex overflow-hidden rounded-[3px] border border-[#d3cfbf] bg-[#f8f8f7] shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
						<button
							onClick={handleZoom(false)}
							className="grid h-8 w-8 place-items-center text-[#7b828f] transition hover:bg-[#f2f3f4]"
							title="Zoom out"
							type="button"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-4.35-4.35"
								/>
								<circle cx="11" cy="11" r="6.5" strokeWidth={2} />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.5 11h5"
								/>
							</svg>
						</button>

						<button
							onClick={handleZoom(true)}
							className="grid h-8 w-8 place-items-center text-[#7b828f] transition hover:bg-[#f2f3f4]"
							title="Zoom in"
							type="button"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-4.35-4.35"
								/>
								<circle cx="11" cy="11" r="6.5" strokeWidth={2} />
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 8.5v5"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.5 11h5"
								/>
							</svg>
						</button>

						<button
							onClick={handleFullscreen}
							className="grid h-8 w-8 place-items-center text-[#7b828f] transition hover:bg-[#f2f3f4]"
							title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
							type="button"
						>
							{isFullscreen ? (
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 5h11v11"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 16L19 5"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			<div
				className={`px-4 py-1 ${legendClassName}`}
				style={isFullscreen ? { display: "none" } : undefined}
			>
				<div className="flex flex-wrap items-center gap-x-6 gap-y-1">
					{[
						{ key: "AGRARIA", label: "Agraria" },
						{ key: "EKOSOSPOL", label: "Ekosospol" },
						{ key: "SUMBER_DAYA_ALAM", label: "Sumber Daya Alam" },
					].map((cat) => {
						const isActive = activeCategorySet.has(cat.key);
						const color = categoryColors[cat.key] || "#8f8b79";

						return (
							<button
								key={cat.key}
								onClick={() => onCategoryToggle?.(cat.key)}
								className="flex items-center gap-2 rounded-md px-1 py-1 text-sm leading-none transition-colors hover:opacity-80"
								type="button"
							>
								<span className="shrink-0">
									<svg
										width="16"
										height="18"
										viewBox="0 0 16 18"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										className={isActive ? "opacity-100" : "opacity-80"}
										style={{ color: isActive ? color : "#8f8b79" }}
									>
										<path
											d="M1 10.6971C1.69435 7.46933 4.56464 5.04999 8 5.04999C11.4354 5.04999 14.3057 7.46933 15 10.6971"
											stroke="currentColor"
											strokeWidth="1.2"
											strokeLinecap="round"
										/>
										<ellipse
											cx="7.99999"
											cy="10.4295"
											rx="2.52089"
											ry="2.52088"
											stroke="currentColor"
											strokeWidth="1.2"
										/>
										{isActive ? (
											<path
												d="M1 10.6971C1.69435 13.9249 4.56464 16.3443 8 16.3443C11.4354 16.3443 14.3057 13.9249 15 10.6971"
												stroke="currentColor"
												strokeWidth="1.2"
												strokeLinecap="round"
											/>
										) : (
											<path
												d="M14.2222 2.77783L1.77774 15.2223"
												stroke="currentColor"
												strokeWidth="1.2"
												strokeLinecap="round"
											/>
										)}
									</svg>
								</span>
								<span
									className="text-[0.62rem] font-medium uppercase tracking-[0.03em] sm:text-[0.7rem]"
									style={{ color: isActive ? color : "#8f8b79" }}
								>
									{cat.label}
								</span>
							</button>
						);
					})}
				</div>

				<p className="mt-1 text-[0.78rem] italic leading-[1.45] text-[#5f6980] sm:text-[0.84rem]">
					{mapInfoText}
				</p>
			</div>
		</div>
	);
}
