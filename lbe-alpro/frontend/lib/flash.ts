// One-shot flash notice for redirect flows (FE-13).
// Toasts (hooks/useToast) do not survive navigation, so create/edit pages
// set a flash before router.push and the list page consumes it on mount.

let flash: string | null = null;

export function setFlash(message: string): void {
  flash = message;
}

export function takeFlash(): string | null {
  const message = flash;
  flash = null;
  return message;
}
