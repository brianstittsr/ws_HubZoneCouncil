"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/conference/schedule" },
  { label: "Agenda", href: "/conference/schedule" },
  { label: "Speakers", href: "/conference/speakers" },
  { label: "Tickets", href: "/conference/tickets" },
  { label: "Venue", href: "/conference/venue" },
  { label: "Sponsorship", href: "/conference/sponsorship" },
  { label: "Speak", href: "/conference/speakers/apply" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="HUBZone on the Rise Logo"
            width={48}
            height={48}
            className="h-12 w-auto rounded-md bg-white"
            priority
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">HUBZone on the Rise</span>
            <span className="text-xs text-muted-foreground">2026 National Conference</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold">
            <Link href="/conference/register">Register</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full bg-[#c9a227] hover:bg-[#b89420] text-[#1a2b4a] font-semibold" asChild>
                  <Link href="/conference/register" onClick={() => setMobileOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
