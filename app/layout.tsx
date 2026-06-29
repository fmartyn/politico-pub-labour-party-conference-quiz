import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Political Pro-Quiz",
  description: "A quiz for aspiring politicos.",
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
