import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps {
	count?: number;
	heightClassName?: string;
	className?: string;
}

export default function Skeleton({
	count = 1,
	heightClassName = "h-4",
	className,
}: SkeletonProps) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={`skeleton-${index}`}
					className={cn(
						"w-full animate-pulse rounded-md bg-neutral-200",
						heightClassName,
					)}
				/>
			))}
		</div>
	);
}
