import type { AIAction } from './types';

// Maps a PULSE AI action to an in-app destination (or a phone call).
export function actionTarget(action: AIAction | null | undefined): { label: string; href?: string; tel?: string } | null {
  if (!action) return null;
  switch (action.type) {
    case 'emergency':
      return { label: "103 ga qo'ng'iroq qilish", tel: '103' };
    case 'view_doctors':
      return {
        label: action.departmentName ? `${action.departmentName} shifokorlari` : "Shifokorlarni ko'rish",
        href: action.department ? `/doctors?department=${action.department}` : '/doctors',
      };
    case 'find_doctor':
    case 'book_appointment':
      return { label: 'Shifokor topish', href: '/doctors' };
    case 'view_queue':
      return { label: "Navbatni ko'rish", href: '/appointments' };
    case 'add_water':
      return { label: 'Suv', href: '/water' };
    case 'add_sleep':
      return { label: 'Uyqu', href: '/sleep' };
    case 'add_workout':
      return { label: 'Workout', href: '/workout' };
    case 'view_medical_history':
      return { label: 'Tibbiy tarix', href: '/medical-history' };
    default:
      return null;
  }
}
