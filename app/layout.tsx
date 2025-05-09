"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LoadingSkeleton from "./skeleton/LoadingSkeleton";
import { Suspense } from "react";
import { Provider } from 'react-redux';
import { store } from './store/store';

const inter = Inter({ subsets: ["latin"],weight:["400","700"]} );
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
