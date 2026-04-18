import { create } from "zustand";
import { API_BASE } from "@/lib/config";

const DEMO_TOKEN_PREFIX = "demo-token-";

export interface AuthUser {
	id?: string | number;
	username?: string;
	display_name?: string;
	avatar?: string;
	email?: string;
	[key: string]: unknown;
}

interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	init: () => Promise<void>;
	refetchUser: () => Promise<void>;
	login: (token: string, userData?: AuthUser | null) => void;
	logout: () => void;
}

const readStoredUser = () => {
	try {
		const raw = localStorage.getItem("auth_user");
		return raw ? (JSON.parse(raw) as AuthUser) : null;
	} catch (error) {
		return null;
	}
};

const readStoredToken = () => {
	try {
		return localStorage.getItem("token");
	} catch (error) {
		return null;
	}
};

const persistUser = (user: AuthUser | null) => {
	if (!user) {
		localStorage.removeItem("auth_user");
		return;
	}
	localStorage.setItem("auth_user", JSON.stringify(user));
};

const clearAuthStorage = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("auth_user");
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: true,
	init: async () => {
		if (typeof window === "undefined") {
			set({ loading: false });
			return;
		}

		const token = readStoredToken();
		if (!token) {
			set({ user: null, loading: false });
			return;
		}

		if (token.startsWith(DEMO_TOKEN_PREFIX)) {
			const demoUser = readStoredUser();
			set({ user: demoUser, loading: false });
			return;
		}

		try {
			const response = await fetch(`${API_BASE}/api/auth/user/`, {
				headers: {
					Authorization: `Token ${token}`,
				},
			});

			if (response.ok) {
				const data = (await response.json()) as AuthUser;
				persistUser(data);
				set({ user: data, loading: false });
			} else {
				clearAuthStorage();
				set({ user: null, loading: false });
			}
		} catch (error) {
			set({ user: null, loading: false });
		}
	},
	refetchUser: async () => {
		set({ loading: true });
		await useAuthStore.getState().init();
	},
	login: (token, userData) => {
		if (typeof window === "undefined") return;
		localStorage.setItem("token", token);
		persistUser(userData ?? null);
		set({ user: userData ?? null, loading: false });
	},
	logout: () => {
		if (typeof window === "undefined") return;
		clearAuthStorage();
		set({ user: null, loading: false });
	},
}));
