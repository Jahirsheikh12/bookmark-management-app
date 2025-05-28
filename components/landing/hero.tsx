"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-16 sm:py-24 md:py-32 w-full">
      <motion.div
        className="space-y-6 text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
          Organize Your Web.
          <br />
          <span className=" bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Simplified.
          </span>
        </h1>
        <p className="mx-auto max-w-[600px] text-gray-500 text-base sm:text-lg md:text-xl dark:text-gray-400 leading-relaxed">
          A modern bookmark manager that helps you organize, find, and access
          your favorite websites from anywhere. Never lose track of important
          links again.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-md sm:max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link href="/signup" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="h-12 px-8 w-full sm:w-auto text-base font-medium"
          >
            Get Started Free
          </Button>
        </Link>
        <Link href="#features" className="w-full sm:w-auto">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 w-full sm:w-auto text-base font-medium"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>

      <motion.div
        className="mt-8 sm:mt-12 w-full max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="rounded-xl border bg-card p-2 sm:p-4 shadow-2xl">
          <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <div className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
                  Preview of Bookmark Manager Dashboard
                </div>
                <div className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                  Experience a clean, intuitive interface designed for
                  productivity
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="absolute top-4 left-16 w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
