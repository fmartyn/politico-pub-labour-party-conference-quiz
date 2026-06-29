import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Political Pro-Quiz",
  description: "A gamified POLITICO Pro quiz for Playbook London with Neon-backed submission capture.",
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
