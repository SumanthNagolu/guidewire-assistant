const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

export function validateEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const formatted = missing.map((key) => `- ${key}`).join("\n");
    throw new Error(
      [
        "Missing required environment variables:",
        formatted,
        "",
        "Add the missing values to your environment configuration (e.g. .env.local) and restart the app.",
      ].join("\n"),
    );
  }
}




