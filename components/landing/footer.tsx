import Link from "next/link";
import { Bookmark } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Bookmark className="h-6 w-6" />
              <span className="text-lg sm:text-xl font-bold">
                Bookmark Manager
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
              A modern bookmark manager to organize your web resources and
              access them from anywhere. Simple, powerful, and designed for
              productivity.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-foreground">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} Bookmark Manager. All rights
              reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for productivity
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
