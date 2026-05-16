import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>;
}) {
  const params = await searchParams;

  let redirectAfterLogin: string | undefined;
  if (params.next) {
    try {
      const decoded = decodeURIComponent(params.next);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) {
        redirectAfterLogin = decoded;
      }
    } catch {
      // ignore malformed next
    }
  }

  return (
    <LoginForm
      initialError={params.error}
      initialMessage={params.message}
      redirectAfterLogin={redirectAfterLogin}
    />
  );
}
