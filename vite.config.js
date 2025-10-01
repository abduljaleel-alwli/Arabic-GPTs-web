import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const sanitizeBase = (value) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed === ".") return "./";
    return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const resolveBase = () => {
    return (
        sanitizeBase(process.env.VITE_BASE) ??
        sanitizeBase(process.env.BASE) ??
        sanitizeBase(process.env.BASE_PATH) ??
        sanitizeBase(process.env.npm_config_base) ??
        "/"
    );
};

export default defineConfig(() => ({
    base: resolveBase(),
    plugins: [react()],
    server: {
        port: 5173,
        open: false,
    },
}));

