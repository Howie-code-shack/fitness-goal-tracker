import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/trpc-provider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { validateConfig } from "@/lib/config";

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
    <html lang="en">
      <body className="antialiased">
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
