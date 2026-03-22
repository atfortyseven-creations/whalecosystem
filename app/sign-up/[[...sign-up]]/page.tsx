import { redirect } from "next/navigation";

// Google OAuth handles both sign-in and sign-up in a single flow.
// All users should go through /login.
export default function SignUpPage() {
  redirect("/login");
}
