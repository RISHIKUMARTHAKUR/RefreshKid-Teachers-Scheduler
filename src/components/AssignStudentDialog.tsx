"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvailabilitySlot, Student } from '@/app/interfaces';
import { formatInTimezone, timezoneKeys, timezoneLabels } from '@/lib/time';
import type { Timezone } from '@/lib/time';

interface AssignStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  slot: AvailabilitySlot;
  teacherTimezone: Timezone;
  onSchedule: (slotId: string, student: Student) => void;
}

export default function AssignStudentDialog({ isOpen, onOpenChange, slot, teacherTimezone, onSchedule }: AssignStudentDialogProps) {
  const [studentName, setStudentName] = useState('');
  const [studentTimezone, setStudentTimezone] = useState<Timezone>('EST');

  const handleSubmit = () => {
    if (studentName && studentTimezone) {
      onSchedule(slot.id, { name: studentName, timezone: studentTimezone });
      onOpenChange(false);
      setStudentName('');
      setStudentTimezone('EST');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Slot</DialogTitle>
          <DialogDescription>
            Assign a student to this available time slot.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="font-code p-3 bg-muted rounded-md text-center">
            <p className="text-sm text-muted-foreground">Teacher Time</p>
            <p className="font-semibold">{formatInTimezone(slot.utcStartTime, teacherTimezone)}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student-name" className="text-right">Student Name</Label>
            <Input id="student-name" value={studentName} onChange={e => setStudentName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student-timezone" className="text-right">Student Timezone</Label>
            <Select value={studentTimezone} onValueChange={(v: Timezone) => setStudentTimezone(v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneKeys.map(tz => <SelectItem key={tz} value={tz}>{timezoneLabels[tz]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="font-code p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md text-center">
            <p className="text-sm text-blue-600 dark:text-blue-300">Converted Student Time</p>
            <p className="font-semibold">{formatInTimezone(slot.utcStartTime, studentTimezone)}</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!studentName} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
