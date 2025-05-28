import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Handle authentication errors
  if (error) {
    console.error("Auth callback error:", error, error_description);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set(
      "error",
      error_description || "Authentication failed"
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Error exchanging code for session:", error);
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("error", "Authentication failed");
        return NextResponse.redirect(redirectUrl);
      }

      // Check if this is a new user (first time sign up)
      if (data.user && !data.user.email_confirmed_at) {
        // For users who need email confirmation
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set(
          "message",
          "Please check your email to confirm your account before signing in."
        );
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error);
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set(
        "error",
        "Something went wrong during authentication"
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url));
}
