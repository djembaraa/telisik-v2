import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
	show?: boolean;
	onClose?: () => void;
	title?: string;
	children?: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "2xl";
	className?: string;
	overlayClassName?: string;
	containerClassName?: string;
	headerClassName?: string;
	titleClassName?: string;
	bodyClassName?: string;
	footerClassName?: string;
	closeButtonClassName?: string;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
};

export default function Modal({
	show = false,
	onClose,
	title,
	children,
	footer,
	size = "md",
	className,
	overlayClassName,
	containerClassName,
	headerClassName,
	titleClassName,
	bodyClassName,
	footerClassName,
	closeButtonClassName,
}: ModalProps) {
	if (!show) return null;

	return (
		<>
			<div
				className={cn("fixed inset-0 z-40 bg-black/50", overlayClassName)}
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				className={cn(
					"fixed inset-0 z-50 flex items-center justify-center p-4",
					containerClassName,
				)}
			>
				<div
					role="dialog"
					aria-modal="true"
					className={cn(
						"w-full rounded-lg bg-white shadow-lg",
						sizeClasses[size],
						className,
					)}
					onClick={(event) => event.stopPropagation()}
				>
					<div
						className={cn(
							"flex items-center justify-between px-4 pt-4 md:px-6",
							headerClassName,
						)}
					>
						<p
							className={cn(
								"text-xl font-bold text-[#555333]",
								titleClassName,
							)}
						>
							{title}
						</p>
						{onClose ? (
							<button
								type="button"
								onClick={onClose}
								className={cn(
									"text-2xl leading-none text-neutral-400 transition-colors hover:text-neutral-600",
									closeButtonClassName,
								)}
								aria-label="Close"
							>
								×
							</button>
						) : null}
					</div>

					<div className={cn("px-4 pb-4 pt-3 md:px-6", bodyClassName)}>
						{children}
					</div>

					{footer ? (
						<div
							className={cn(
								"flex justify-end gap-3 px-4 pb-4 md:px-6",
								footerClassName,
							)}
						>
							{footer}
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}
