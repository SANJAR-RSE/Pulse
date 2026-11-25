import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Shown for any unknown URL (instead of Next's default English 404).
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Sahifa topilmadi</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Siz qidirgan sahifa mavjud emas yoki ko&apos;chirilgan. Bosh sahifaga qaytib, davom eting.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants(), "mt-2")}>
        Bosh sahifaga qaytish
      </Link>
    </main>
  );
}
