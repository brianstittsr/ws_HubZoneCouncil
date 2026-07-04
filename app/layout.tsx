import type { Metadata } from "next";
import { Manrope, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hubzonecouncil.org"),
  title: {
    default: "HUBZone on the Rise | 2026 National HUBZone Conference",
    template: "%s | HUBZone on the Rise",
  },
  description:
    "Join the 2026 National HUBZone Conference, July 21-22, 2026 at the Westfields Marriott in Chantilly, Virginia. Building America's next 250 years through stronger partnerships, stronger communities, and a stronger America.",
  keywords: [
    "HUBZone",
    "HUBZone conference",
    "HUBZone on the Rise",
    "National HUBZone Conference",
    "federal contracting",
    "small business",
    "workforce development",
    "manufacturing",
    "supply chain",
    "economic opportunity",
    "Appalachian HUBZone",
    "HUBZone certification",
  ],
  authors: [{ name: "HUBZone Contractors National Council", url: "https://hubzonecouncil.org" }],
  creator: "HUBZone Contractors National Council",
  publisher: "HUBZone Contractors National Council",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://hubzonecouncil.org",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hubzonecouncil.org",
    siteName: "HUBZone on the Rise",
    title: "HUBZone on the Rise | 2026 National HUBZone Conference",
    description:
      "Join the 2026 National HUBZone Conference, July 21-22, 2026 at the Westfields Marriott in Chantilly, Virginia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HUBZone on the Rise - 2026 National HUBZone Conference",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HUBZone on the Rise | 2026 National HUBZone Conference",
    description:
      "Join the 2026 National HUBZone Conference, July 21-22, 2026 at the Westfields Marriott in Chantilly, Virginia.",
    images: ["/og-image.png"],
    creator: "@hubzonecouncil",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Skip to main content link for keyboard users - WCAG 2.4.1 */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${manrope.variable} ${dmSans.variable} font-sans antialiased`}>
        {/* Skip to main content link - WCAG 2.4.1 Bypass Blocks */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
