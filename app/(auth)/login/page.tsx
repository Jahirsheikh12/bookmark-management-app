import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | Bookmark Manager",
  description: "Login to your Bookmark Manager account",
};

export default function LoginPage() {
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
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/signup"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
