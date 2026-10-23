export type ReactivationNotice = {
  code: "customer_reactivation_required";
  title: string;
  message: string;
  primary_email: string | null;
  delivery: "sent" | "missing_email" | "unavailable";
};

export type LoginResponse =
  | { kind: "authenticated"; access: string; refresh: string }
  | { kind: "reactivation"; notice: ReactivationNotice };

export async function requestLogin(username: string, password: string): Promise<LoginResponse> {
  // This additive endpoint owns the shared recovery rules for web and mobile.
  // Keep the legacy /token/ endpoint unchanged for older installed apps.
  const response = await fetch("https://api-livetakeoff.herokuapp.com/api/token/web/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  // Never display raw HTML/server errors on the login screen.
  const data = await response.json().catch(() => null);
  if (
    response.status === 403 &&
    data?.code === "customer_reactivation_required" &&
    typeof data.title === "string" &&
    typeof data.message === "string" &&
    (data.primary_email === null || typeof data.primary_email === "string") &&
    ["sent", "missing_email", "unavailable"].includes(data.delivery)
  ) {
    return { kind: "reactivation", notice: data };
  }
  if (!response.ok || typeof data?.access !== "string" || !data.access ||
      typeof data?.refresh !== "string" || !data.refresh) {
    throw new Error("Login failed");
  }
  return { kind: "authenticated", access: data.access, refresh: data.refresh };
}
