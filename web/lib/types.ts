// Types mirroring API_CONTRACT.md exactly. Frontend never invents fields.

export type Role = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  telegramLinked: boolean;
}

export interface Clinic {
  _id: string;
  name: string;
  logo: string;
  address: string;
  phone: string;
  workingHours: string;
  description: string;
  rating: number;
}

export interface Department {
  _id: string;
  name: string;
  icon: string;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  clinic: Clinic;
  department: Department;
  workingDays: string[];
  workingHours: { start: string; end: string };
}

export interface NextAppointmentSummary {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  departmentName: string;
}

export interface QueueStatus {
  code: string;
  status: "WAITING" | "NEAR" | "CALLED" | "COMPLETED" | "CANCELLED";
  aheadCount: number;
  estimatedWaitMinutes: number;
}

export interface DashboardData {
  goals: HealthGoals;
  water: { consumedMl: number; goalMl: number };
  sleep: { durationMinutes: number } | null;
  workout: { totalMinutes: number };
  medication: { taken: number; total: number };
  nextAppointment: NextAppointmentSummary | null;
  queue: QueueStatus | null;
  healthScore: number;
}

export interface WeekStats {
  from: string;
  to: string;
  waterLiters: number;
  sleepHours: number;
  avgSleepHours: number | null;
  workoutSessions: number;
  workoutMinutes: number;
  medicationAdherence: number | null;
  appointments: number;
  queueAverageMinutes: number | null;
}

export interface StatisticsData {
  waterLiters: number;
  sleepHours: number;
  workoutSessions: number;
  medicationAdherence: number | null;
  appointments: number;
  queueAverageMinutes: number | null;
  thisWeek: WeekStats;
  lastWeek: WeekStats;
  weeklyGoals: { waterLiters: number; sleepHours: number; workoutMinutes: number; setBy: string };
}

export interface WaterLog {
  _id: string;
  amountMl: number;
  date: string;
  createdAt: string;
}

export interface SleepLog {
  _id: string;
  sleepTime: string;
  wakeTime: string;
  durationMinutes: number;
  date: string;
}

export interface Workout {
  _id: string;
  type: string;
  durationMinutes: number;
  calories?: number;
  date: string;
}

export type MealRelation = "any" | "before" | "after" | "with";

export interface Medication {
  _id: string;
  name: string;
  time: string;
  active: boolean;
  takenToday?: boolean;
  source?: "self" | "doctor";
  dosage?: string;
  mealRelation?: MealRelation;
  note?: string;
  startDate?: string;
  endDate?: string;
  timesPerDay?: number;
  intakeIndex?: number;
  courseId?: string;
  doctorName?: string;
}

/** What the doctor writes at an exam (one entry per medicine). */
export interface PrescriptionInput {
  name: string;
  dosage: string;
  times: string[];
  mealRelation: MealRelation;
  durationDays: number;
  note: string;
}

export interface Prescription extends PrescriptionInput {
  startDate?: string;
  endDate?: string;
}

export interface HealthGoals {
  waterMl: number;
  sleepHours: number;
  workoutMinutes: number;
  setBy: string;
  setAt: string | null;
  note: string;
}

export const MEAL_LABEL: Record<MealRelation, string> = {
  any: "Farqi yo'q",
  before: "Och qoringa (ovqatdan oldin)",
  after: "To'q qoringa (ovqatdan keyin)",
  with: "Ovqat bilan birga",
};

export interface Appointment {
  _id: string;
  patient: string;
  doctor: Doctor;
  clinic: Clinic;
  department: Department;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface LabResult {
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
}

export interface MedicalRecord {
  _id: string;
  patient: string;
  doctor: Doctor;
  clinic: Clinic;
  department: Department;
  appointment: string;
  date: string;
  examination: string;
  recommendation: string;
  labResults: LabResult[];
  prescriptions?: Prescription[];
  goals?: { waterMl?: number; sleepHours?: number; workoutMinutes?: number; note?: string };
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: string;
  description: string;
}

export interface AIAction {
  type:
    | "view_doctors"
    | "book_appointment"
    | "view_queue"
    | "add_water"
    | "add_sleep"
    | "add_workout"
    | "view_medical_history"
    | "find_doctor"
    | "emergency";
  department?: string;
  /** True when the reply is symptom routing — UI shows the no-diagnosis notice. */
  medicalNotice?: boolean;
  departmentName?: string;
  appointmentId?: string;
  [key: string]: unknown;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface DoctorPanelQueueEntry {
  _id: string;
  code: string;
  position: number;
  status: "WAITING" | "NEAR" | "CALLED" | "COMPLETED" | "CANCELLED";
  patient: { name: string };
  appointment: Appointment;
  date: string;
  /** Exam record already written for this visit. */
  hasRecord?: boolean;
}

export const SAFETY_NOTICE =
  "Men shifokor o'rnini bosa olmayman. Tegishli shifokor yoki tibbiy yordamga murojaat qiling.";

// ---- Admin panel ----
export interface AdminOverview {
  today: string;
  users: {
    total: number;
    patients: number;
    doctors: number;
    admins: number;
    newThisWeek: number;
    newLastWeek: number;
    telegramLinked: number;
    activeThisWeek: number;
  };
  appointments: {
    total: number;
    today: number;
    upcoming: number;
    thisWeek: number;
    lastWeek: number;
    byStatus: Record<"pending" | "confirmed" | "completed" | "cancelled", number>;
  };
  queueToday: { waiting: number; called: number; completed: number; cancelled: number };
  clinical: { records: number; prescriptions: number; aiQuestions: number; notifications: number };
  health: { waterLogs: number; sleepLogs: number; workouts: number };
  catalog: { doctors: number; clinics: number; departments: number };
  series: { date: string; users: number; appointments: number }[];
  topDoctors: { _id: string; name: string; specialty: string; count: number }[];
  topDepartments: { _id: string; name: string; count: number }[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  telegramLinked: boolean;
  appointments: number;
}

export interface AdminUsersPage {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminAppointment {
  _id: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  patient?: { _id: string; name: string; email: string } | null;
  doctor?: { _id: string; firstName: string; lastName: string; specialty: string } | null;
  department?: { _id: string; name: string } | null;
  clinic?: { _id: string; name: string } | null;
}
