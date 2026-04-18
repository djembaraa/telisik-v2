import { API_BASE } from "@/lib/config";

const DEFAULT_REMOTE_API = "https://api.telisik.org";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export const resolveApiBase = () => {
  if (API_BASE) return API_BASE;
  if (typeof window === "undefined") return "";
  return LOCAL_HOSTS.has(window.location.hostname) ? DEFAULT_REMOTE_API : "";
};

export const resolveApiUrl = (path: string) => {
  const base = resolveApiBase();
  if (!base) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected JSON response");
  }
  return (await response.json()) as T;
};
