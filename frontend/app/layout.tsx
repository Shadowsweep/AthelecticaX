import React from "react";
import Providers from "./providers";
import "./globals.css";

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
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
