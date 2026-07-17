import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter with the Vietnamese subset always loaded — never lazy-loaded.
 * Per-contact language preference (D-08) means VI names and strings can appear
 * on any screen at any time (Design_System.md §5.1).
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Loan Factory CRM",
    template: "%s · Loan Factory CRM",
  },
  description:
    "An AI-powered mortgage CRM: leads, contacts, referral partners, opportunity stages, and follow-up that AI prepares and you approve.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
