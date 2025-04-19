import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoadingSkeleton from "./skeleton/LoadingSkeleton";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"],weight:["400","700"]} );
export const metadata: Metadata = {
  title: "WeatherNow - Real-time Weather Updates",
  description: "Get accurate, real-time weather forecasts and temperature updates for your city. Stay prepared with WeatherNow!", 
  authors:{name:"Hou Jianda",url:"https://github.com/jiandahou"},
  applicationName:"My Weather App",
  creator:"Hou Jianda"
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Suspense fallback={<LoadingSkeleton />}>
          {children}
      </Suspense>
      </body>
    </html>
  );
}
