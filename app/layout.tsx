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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
              window.addEventListener('beforeunload', function () {
                if (location.pathname.indexOf('/weather/') === 0) {
                  window.scrollTo(0, 0);
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                }
              });
            `,
          }}
        />
      </head>
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
