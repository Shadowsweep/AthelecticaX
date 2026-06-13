import React from "react";
import { Inter, Orbitron, Roboto_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata = {
  title: "AthleticaX | Corporate Attendance & Sports Management",
  description: "Enterprise Sports-Tech Command Center for Corporate Employee Engagement, Attendance & Sports Management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${robotoMono.variable}`}
    >
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
