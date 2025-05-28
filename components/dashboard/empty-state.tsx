"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 sm:p-12 md:p-16 text-center min-h-[400px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Bookmark className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
      </div>

      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-3">
        {title}
      </h3>

      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
        {description}
      </p>

      {action && (
        <Link href={action.href}>
          <Button size="lg" className="h-11 px-6 text-base font-medium">
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
