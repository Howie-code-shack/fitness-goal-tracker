import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/trpc-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { validateConfig } from "@/lib/config";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/PWARegister";

// Validate environment configuration on app startup
validateConfig();

export const metadata: Metadata = {
  title: "Fitness Goal Tracker",
  description: "Track your running, cycling, and swimming goals",
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitTracker",
  },
  icons: {
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
        <PWARegister />
      </body>
    </html>
  );
}
