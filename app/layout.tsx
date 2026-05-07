import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import LoadingSkeleton from "./skeleton/LoadingSkeleton";
import StoreProvider from "./provider/StoreProvider";

export const metadata: Metadata = {
  title: "WeatherApp",
  description: "Real-time weather forecasts for cities worldwide",
};

const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
