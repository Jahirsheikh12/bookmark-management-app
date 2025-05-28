import { SignUpForm } from "@/components/auth/signup-form";
import { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | Bookmark Manager",
  description: "Create a new Bookmark Manager account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Bookmark className="h-6 w-6" />
        <span className="font-bold">Bookmark Manager</span>
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your details to create a new account
          </p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
