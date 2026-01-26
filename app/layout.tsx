import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/trpc-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { validateConfig } from "@/lib/config";
import { Toaster } from "sonner";

// Validate environment configuration on app startup
validateConfig();

export const metadata: Metadata = {
  title: "Fitness Goal Tracker",
  description: "Track your running, cycling, and swimming goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <SessionProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
