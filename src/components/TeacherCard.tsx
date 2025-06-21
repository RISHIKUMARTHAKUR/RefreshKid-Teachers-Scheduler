"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, User, Trash2, CalendarDays } from 'lucide-react';
import type { Teacher, AvailabilitySlot, Student } from '@/app/interfaces';
import { formatInTimezone, timezoneKeys, timezoneLabels } from '@/lib/time';
import AssignStudentDialog from './AssignStudentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeacherCardProps {
  teacher: Teacher;
  slots: AvailabilitySlot[];
  onSchedule: (slotId: string, student: Student) => void;
  onDelete: (slotId: string) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export default function TeacherCard({ teacher, slots, onSchedule, onDelete, onDeleteTeacher }: TeacherCardProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const handleScheduleClick = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmDelete = () => {
    onDeleteTeacher(teacher.id);
  }

  const sortedSlots = slots.sort((a, b) => new Date(a.utcStartTime).getTime() - new Date(b.utcStartTime).getTime());

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <CardTitle className="flex items-center gap-2 font-headline">
                <User className="w-6 h-6 text-primary" />
                {teacher.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1">
                <Book className="w-4 h-4" /> {teacher.subject}
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive flex-shrink-0 hover:bg-destructive/10">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {teacher.name} and all of their availability slots.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete Teacher</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Available Slots
          </h4>
          <div className="space-y-4">
            {sortedSlots.length > 0 ? sortedSlots.map(slot => (
              <div key={slot.id} className="p-3 rounded-lg border">
                <div className="space-y-2 mb-3">
                  {timezoneKeys.map(tz => (
                    <div key={tz} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{tz}</span>
                      <span className="font-code font-semibold">{formatInTimezone(slot.utcStartTime, tz)}</span>
                    </div>
                  ))}
                </div>
                {slot.student ? (
                  <div className="flex items-center justify-between bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                    <div className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Scheduled with: {slot.student.name} ({slot.student.timezone})
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(slot.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleScheduleClick(slot)}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Schedule
                  </Button>
                )}
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No available slots.</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="secondary">{timezoneLabels[teacher.timezone]}</Badge>
        </CardFooter>
      </Card>
      {selectedSlot && (
        <AssignStudentDialog
          isOpen={!!selectedSlot}
          onOpenChange={() => setSelectedSlot(null)}
          slot={selectedSlot}
          teacherTimezone={teacher.timezone}
          onSchedule={onSchedule}
        />
      )}
    </>
  );
}
