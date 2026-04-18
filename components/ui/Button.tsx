import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
	primary: "bg-telisik text-white hover:bg-telisik-dark active:bg-telisik-dark",
	secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400",
	outline:
		"border-2 border-telisik text-telisik hover:bg-telisik hover:text-white active:bg-telisik-dark",
	danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700",
	ghost: "text-telisik hover:bg-telisik/10 active:bg-telisik/20",
} as const;

const sizeStyles = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
} as const;

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variantStyles;
	size?: keyof typeof sizeStyles;
	fullWidth?: boolean;
	loading?: boolean;
}

export default function Button({
	children,
	variant = "primary",
	size = "md",
	fullWidth = false,
	disabled = false,
	loading = false,
	className,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				"font-medium rounded-lg transition-colors duration-200",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				"focus:outline-none focus:ring-2 focus:ring-telisik/40 focus:ring-offset-2 focus:ring-offset-[#faf6ef]",
				variantStyles[variant] || variantStyles.primary,
				sizeStyles[size] || sizeStyles.md,
				fullWidth && "w-full",
				className,
			)}
			disabled={disabled || loading}
			aria-busy={loading}
			{...props}
		>
			{loading ? (
				<span className="flex items-center justify-center gap-2">
					<svg
						className="h-4 w-4 animate-spin"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					{children}
				</span>
			) : (
				children
			)}
		</button>
	);
}
