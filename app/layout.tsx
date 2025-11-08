import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";

export const metadata: Metadata = {
  title: "InTime eSolutions - Transform Your Career. Power Your Business.",
  description: "Where Excellence Meets Opportunity - IT Staffing, Skill Development, and Cross-Border Solutions That Deliver Results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}

