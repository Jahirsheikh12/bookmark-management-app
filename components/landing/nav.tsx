"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Bookmark, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          <span className="text-lg sm:text-xl font-bold">Bookmark Manager</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
          >
            About
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-9 px-4">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="h-9 px-4">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
              Login
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-6 w-6" />
                  <span className="text-lg font-bold">Bookmark Manager</span>
                </div>

                <nav className="flex flex-col space-y-4">
                  <Link
                    href="#features"
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#"
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-base font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </Link>
                </nav>

                <div className="flex flex-col space-y-3 pt-4 border-t">
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-10">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
