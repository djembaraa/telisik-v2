import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: boolean;
	errorMessage?: string;
	hint?: string;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
}

export default function Input({
	label,
	error = false,
	errorMessage,
	hint,
	icon,
	iconPosition = "left",
	fullWidth = true,
	className,
	id,
	...props
}: InputProps) {
	const inputId = id ?? React.useId();

	return (
		<div className={cn("flex flex-col gap-1", fullWidth && "w-full")}> 
			{label ? (
				<label
					htmlFor={inputId}
					className="text-sm font-medium text-neutral-700"
				>
					{label}
					{props.required ? (
						<span className="ml-1 text-danger-600">*</span>
					) : null}
				</label>
			) : null}

			<div className="relative flex items-center">
				{icon && iconPosition === "left" ? (
					<span className="pointer-events-none absolute left-3 flex items-center text-neutral-500">
						{icon}
					</span>
				) : null}

				<input
					id={inputId}
					className={cn(
						"w-full rounded-lg border-2 px-3 py-2 text-sm",
						"transition-colors duration-200 placeholder:text-neutral-400",
						"focus:outline-none focus:ring-2 focus:ring-offset-0",
						error
							? "border-danger-300 focus:border-danger-600 focus:ring-danger-100"
							: "border-neutral-300 focus:border-telisik focus:ring-telisik/10",
						icon && iconPosition === "left" && "pl-10",
						icon && iconPosition === "right" && "pr-10",
						"disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60",
						className,
					)}
					{...props}
				/>

				{icon && iconPosition === "right" ? (
					<span className="pointer-events-none absolute right-3 flex items-center text-neutral-500">
						{icon}
					</span>
				) : null}
			</div>

			{error && errorMessage ? (
				<span className="text-xs text-danger-600">{errorMessage}</span>
			) : null}

			{hint && !error ? (
				<span className="text-xs text-neutral-500">{hint}</span>
			) : null}
		</div>
	);
}
