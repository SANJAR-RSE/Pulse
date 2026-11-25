import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/types";
import {
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  CalendarCheck,
  Building2,
  FileClock,
  BarChart3,
  Bell,
  Siren,
  UserRound,
  Droplet,
  Moon,
  Dumbbell,
  Pill,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  inBottomNav?: boolean;
}

// Personal-health pages are for patients/doctors; the admin gets the admin panel instead.
const PERSONAL: Role[] = ["patient", "doctor"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Admin panel", icon: ShieldCheck, roles: ["admin"], inBottomNav: true },
  { href: "/dashboard", roles: PERSONAL, label: "Dashboard", icon: LayoutDashboard, inBottomNav: true },
  { href: "/ai", roles: PERSONAL, label: "PULSE AI", icon: Sparkles, inBottomNav: true },
  { href: "/doctors", label: "Shifokorlar", icon: Stethoscope, inBottomNav: true },
  { href: "/appointments", roles: PERSONAL, label: "Navbatlarim", icon: CalendarCheck, inBottomNav: true },
  { href: "/clinics", label: "Klinikalar", icon: Building2 },
  { href: "/water", roles: PERSONAL, label: "Suv", icon: Droplet },
  { href: "/sleep", roles: PERSONAL, label: "Uyqu", icon: Moon },
  { href: "/workout", roles: PERSONAL, label: "Workout", icon: Dumbbell },
  { href: "/medications", roles: PERSONAL, label: "Dorilar", icon: Pill },
  { href: "/medical-history", roles: PERSONAL, label: "Tibbiy tarix", icon: FileClock },
  { href: "/statistics", roles: PERSONAL, label: "Statistika", icon: BarChart3 },
  { href: "/notifications", label: "Bildirishnomalar", icon: Bell },
  { href: "/emergency", roles: PERSONAL, label: "Favqulodda", icon: Siren },
  {
    href: "/doctor-panel",
    label: "Shifokor paneli",
    icon: ClipboardList,
    roles: ["doctor"],
  },
  { href: "/profile", label: "Profil", icon: UserRound, inBottomNav: true },
];

/** Where a signed-in user lands (login, "/", etc.). */
export function homePath(role?: NavItem["roles"] extends (infer R)[] | undefined ? R : never): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

/** Nav items visible to a role. */
export function navFor(role?: Role) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role ?? "patient"));
}
