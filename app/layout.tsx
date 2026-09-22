import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Politico Pub Quiz at Labour Party Conference",
  description: "Test your Westminster instincts at the Politico Pub.",
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
