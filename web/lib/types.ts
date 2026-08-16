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
  water: { consumedMl: number; goalMl: number };
  sleep: { durationMinutes: number } | null;
  workout: { totalMinutes: number };
  medication: { taken: number; total: number };
  nextAppointment: NextAppointmentSummary | null;
  queue: QueueStatus | null;
  healthScore: number;
}

export interface StatisticsData {
  waterLiters: number;
  sleepHours: number;
  workoutSessions: number;
  medicationAdherence: number | null;
  appointments: number;
  queueAverageMinutes: number | null;
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

export interface Medication {
  _id: string;
  name: string;
  time: string;
  active: boolean;
  takenToday?: boolean;
}

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
    | "find_doctor";
  department?: string;
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
}

export const SAFETY_NOTICE =
  "Men shifokor o'rnini bosa olmayman. Tegishli shifokor yoki tibbiy yordamga murojaat qiling.";
