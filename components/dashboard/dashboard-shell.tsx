"use client";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { Search } from "@/components/dashboard/search";
import { Bookmark, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 md:gap-6 lg:gap-10">
            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 w-[300px] sm:w-[350px]">
                <div className="px-4 py-6">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2"
                  >
                    <Bookmark className="h-6 w-6" />
                    <span className="font-bold">Bookmark Manager</span>
                  </Link>
                </div>
                <div className="px-2">
                  <DashboardNav />
                </div>
              </SheetContent>
            </Sheet>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2 md:flex"
            >
              <Bookmark className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Bookmark Manager
              </span>
            </Link>

            <div className="flex-1 md:flex-none md:w-auto">
              <Search />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="w-full flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10 px-4">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r py-6 pr-2 md:sticky md:block">
          <DashboardNav />
        </aside>

        <main className="flex w-full flex-col overflow-hidden py-6 space-y-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
