import type { Timezone } from '@/lib/time';

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  timezone: Timezone;
}

export interface Student {
  name: string;
  timezone: Timezone;
}

export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  utcStartTime: string;
  student?: Student;
}
