import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "London Playbook Summit Quiz",
  description: "Animated summit quiz with Neon-backed lead capture.",
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
