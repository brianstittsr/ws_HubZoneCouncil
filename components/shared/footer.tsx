import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  conference: [
    { title: "Schedule", href: "/conference/schedule" },
    { title: "Speakers", href: "/conference/speakers" },
    { title: "Tickets", href: "/conference/tickets" },
    { title: "Venue", href: "/conference/venue" },
    { title: "Sponsorship", href: "/conference/sponsorship" },
    { title: "Become a Speaker", href: "/conference/speakers/apply" },
  ],
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Accessibility", href: "/accessibility" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand Column */}
          <div className="space-y-4 max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="HUBZone on the Rise Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">HUBZone on the Rise</span>
                <span className="text-xs text-gray-400">2026 National Conference</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400">
              The 2026 National HUBZone Conference brings together government, industry, 
              academia, and small businesses to build America&apos;s next 250 years.
            </p>
            <div className="flex gap-4">
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://youtube.com" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Conference Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#c9a227]">Conference</h3>
            <ul className="space-y-2">
              {footerLinks.conference.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#c9a227]">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <Link href="tel:+1-240-442-1787" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone className="h-4 w-4" />
                  240-442-1787
                </Link>
              </li>
              <li>
                <Link href="mailto:info@hubzonecouncil.org" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail className="h-4 w-4" />
                  info@hubzonecouncil.org
                </Link>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>PO Box 355<br />Oakland, MD 21550</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} HUBZone Contractors National Council. HUBZone on the Rise. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
