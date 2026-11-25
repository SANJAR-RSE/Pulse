// Deep links that are not screens. pulse://google-auth?… is the end of the
// Google sign-in (handled by google-auth.ts) — don't navigate anywhere for it.
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (path.includes('google-auth')) return initial ? '/' : null;
  } catch {
    // fall through
  }
  return path;
}
