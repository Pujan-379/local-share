import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "local-share",
  description: "Share text and files with anyone on your WiFi network — no login required.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%23121417'/><circle cx='16' cy='16' r='5' fill='%234ADE80'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}