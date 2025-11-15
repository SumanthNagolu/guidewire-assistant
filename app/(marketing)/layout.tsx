import type { Metadata } from "next";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
export const metadata: Metadata = {
  title: "InTime eSolutions - Transform Your Career. Power Your Business.",
  description: "Where Excellence Meets Opportunity - IT Staffing, Skill Development, and Cross-Border Solutions That Deliver Results.",
  keywords: "IT staffing, technology recruiting, cross-border solutions, H1B to Canada, training programs, Guidewire training, software development bootcamp",
};
export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
