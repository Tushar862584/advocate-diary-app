import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

// Use Outfit as the main font with proper fallbacks
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Fira Sans",
    "Droid Sans",
    "Helvetica Neue",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "Advocate Diary",
  description: "Manage legal cases, hearings, and documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </head>
      <body
        className={`antialiased text-foreground bg-background ${outfit.className} text-[15px] sm:text-base`}
      >
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              maxWidth: "95vw",
              margin: "0 auto",
              fontSize: "0.875rem",
              padding: "0.5rem 0.75rem",
            },
          }}
        />
        <AuthProvider>
          <div className="max-w-[100vw] overflow-x-hidden">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
