"use server";

import { redirect } from "next/navigation";

import { loginBackendAdmin } from "@/lib/backend-api";
import {
  clearAdminSession,
  setAdminSession,
} from "@/lib/session";

export async function loginAdminAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  try {
    const loginResponse = await loginBackendAdmin({
      password,
      username,
    });

    await setAdminSession({
      accessToken: loginResponse.accessToken,
    });
  } catch {
    redirect("/admin?error=invalid");
  }
  redirect("/admin");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin");
}
