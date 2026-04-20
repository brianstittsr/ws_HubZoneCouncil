import Link from "next/link";
import Image from "next/image";
import { Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Accessibility", href: "/accessibility" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand Column */}
          <div className="space-y-4 max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="HubZone Council Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">HubZone Council</span>
                <span className="text-xs text-gray-400">Works for America</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400">
              Supporting HUBZone businesses and federal contractors through education, 
              networking, and advocacy to create economic opportunity.
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

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Contact Us</h3>
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
            © {new Date().getFullYear()} HUBZone Contractors National Council. All rights reserved.
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
