import * as React from "react";
import { cn } from "@/lib/utils";

const typeStyles = {
	info: "bg-blue-50 border-blue-200 text-blue-800",
	success: "bg-success-50 border-success-100 text-success-700",
	warning: "bg-warning-50 border-warning-100 text-warning-700",
	danger: "bg-danger-50 border-danger-100 text-danger-700",
} as const;

export interface AlertProps {
	type?: keyof typeof typeStyles;
	message?: string;
	onClose?: () => void;
	onRetry?: () => void;
	title?: string;
	className?: string;
}

export default function Alert({
	type = "info",
	message,
	onClose,
	onRetry,
	title,
	className,
}: AlertProps) {
	if (!message) return null;

	return (
		<div
			className={cn(
				"flex items-start justify-between gap-3 rounded-lg border border-l-4 p-4",
				typeStyles[type] || typeStyles.info,
				className,
			)}
			role="alert"
		>
			<div className="flex-1">
				{title ? <h4 className="mb-1 font-semibold">{title}</h4> : null}
				<p className="text-sm">{message}</p>
			</div>
			<div className="flex items-center gap-2">
				{onRetry ? (
					<button
						type="button"
						onClick={onRetry}
						className="whitespace-nowrap rounded border bg-white px-3 py-1 text-sm transition-colors hover:bg-neutral-50"
					>
						Retry
					</button>
				) : null}
				{onClose ? (
					<button
						type="button"
						onClick={onClose}
						className="text-neutral-500 transition-colors hover:text-neutral-700"
						aria-label="Close"
					>
						×
					</button>
				) : null}
			</div>
		</div>
	);
}
