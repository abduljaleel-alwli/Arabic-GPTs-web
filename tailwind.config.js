/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    safelist: [
        // تمكين ألوان التدرّج الديناميكية القادمة من JSON
        {
            pattern:
                /(from|via|to)-(zinc|gray|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(100|200|300|400|500|600|700|800|900)/,
        },
        // اتجاهات شائعة للتدرّجات
        "bg-gradient-to-r",
        "bg-gradient-to-l",
        "bg-gradient-to-t",
        "bg-gradient-to-b",
        "bg-gradient-to-tr",
        "bg-gradient-to-br",
        "bg-gradient-to-tl",
        "bg-gradient-to-bl",
    ],
    theme: {
        extend: {
            colors: {
                base: {
                    950: "#0b0b0c",
                    900: "#0f1012"
                }
            },
            fontFamily: {
                arabic: ['"Noto Sans Arabic"', "system-ui", "sans-serif"]
            }
        }
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
        require("@tailwindcss/aspect-ratio"),
        require("@tailwindcss/line-clamp")
    ]
};
