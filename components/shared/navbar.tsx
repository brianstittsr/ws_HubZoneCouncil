"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="HubZone Council Logo"
            width={48}
            height={48}
            className="h-12 w-auto rounded-md bg-white"
            priority
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none">HubZone Council</span>
            <span className="text-xs text-muted-foreground">Works for America</span>
          </div>
        </Link>

        {/* Desktop Navigation - Simplified */}
        <nav className="hidden lg:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link 
            href="/contact" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Get Assessment</Link>
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
            <nav className="flex flex-col gap-4 mt-8">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact
                </Link>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    Get Assessment
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
