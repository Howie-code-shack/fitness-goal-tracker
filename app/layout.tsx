import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/api/trpc-provider";

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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
