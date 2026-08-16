import type { AIAction } from "@/lib/types";

export function actionToLink(action: AIAction | null | undefined): {
  label: string;
  href: string;
} | null {
  if (!action) return null;
  switch (action.type) {
    case "view_doctors":
      return {
        label: "Shifokorlarni ko'rish",
        href: action.department
          ? `/doctors?department=${action.department}`
          : "/doctors",
      };
    case "find_doctor":
      return { label: "Shifokor topish", href: "/doctors" };
    case "book_appointment":
      return { label: "Navbat olish", href: "/doctors" };
    case "view_queue":
      return { label: "Navbatni ko'rish", href: "/appointments" };
    case "add_water":
      return { label: "Suvni qo'shish", href: "/water" };
    case "add_sleep":
      return { label: "Uyquni qayd etish", href: "/sleep" };
    case "add_workout":
      return { label: "Workout qo'shish", href: "/workout" };
    case "view_medical_history":
      return { label: "Medical History", href: "/medical-history" };
    default:
      return null;
  }
}
