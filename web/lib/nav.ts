import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: ("patient" | "doctor" | "admin")[];
  inBottomNav?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, inBottomNav: true },
  { href: "/ai", label: "PULSE AI", icon: Sparkles, inBottomNav: true },
  { href: "/doctors", label: "Shifokorlar", icon: Stethoscope, inBottomNav: true },
  { href: "/appointments", label: "Navbatlarim", icon: CalendarCheck, inBottomNav: true },
  { href: "/clinics", label: "Klinikalar", icon: Building2 },
  { href: "/water", label: "Suv", icon: Droplet },
  { href: "/sleep", label: "Uyqu", icon: Moon },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/medications", label: "Dorilar", icon: Pill },
  { href: "/medical-history", label: "Tibbiy tarix", icon: FileClock },
  { href: "/statistics", label: "Statistika", icon: BarChart3 },
  { href: "/notifications", label: "Bildirishnomalar", icon: Bell },
  { href: "/emergency", label: "Favqulodda", icon: Siren },
  {
    href: "/doctor-panel",
    label: "Shifokor paneli",
    icon: ClipboardList,
    roles: ["doctor"],
  },
  { href: "/profile", label: "Profil", icon: UserRound, inBottomNav: true },
];
