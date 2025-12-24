/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                prime: '#e11d48', // High contrast red/pink for buttons
                dark: '#0f172a',
            }
        },
    },
    plugins: [],
}
