"use client";

import { useState, useMemo } from 'react';
import type { Teacher, AvailabilitySlot, Student } from '@/app/interfaces';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import AddTeacherDialog from '@/components/AddTeacherDialog';
import TeacherCard from '@/components/TeacherCard';
import ScheduledTimes from '@/components/ScheduledTimes';
import Header from '@/components/Header';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'Dr. Evelyn Reed', subject: 'Quantum Physics', timezone: 'EST' }
  ]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    { id: '101', teacherId: '1', utcStartTime: '2024-09-16T14:00:00.000Z' },
    { id: '102', teacherId: '1', utcStartTime: '2024-09-17T15:00:00.000Z', student: { name: 'Alex', timezone: 'IST' } }
  ]);
  const [isAddTeacherOpen, setAddTeacherOpen] = useState(false);

  const { toast } = useToast();

  const handleAddTeacher = (teacher: Omit<Teacher, 'id'>, newSlots: Omit<AvailabilitySlot, 'id' | 'teacherId'>[]) => {
    const newTeacherId = String(Date.now());
    const newTeacher = { ...teacher, id: newTeacherId };
    const newTeacherSlots = newSlots.map(slot => ({
      ...slot,
      id: String(Date.now() + Math.random()),
      teacherId: newTeacherId,
    }));

    setTeachers(prev => [...prev, newTeacher]);
    setSlots(prev => [...prev, ...newTeacherSlots]);
    toast({
      title: "Teacher Added",
      description: `${newTeacher.name} has been added to the scheduler.`,
    });
  };

  const handleScheduleSlot = (slotId: string, student: Student) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === slotId ? { ...slot, student } : slot
      )
    );
    toast({
      title: "Schedule Confirmed",
      description: `A new session has been scheduled.`,
    });
  };

  const handleDeleteSchedule = (slotId: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.id === slotId ? { ...slot, student: undefined } : slot
      )
    );
    toast({
      title: "Schedule Deleted",
      description: "The scheduled session has been removed.",
      variant: "destructive",
    });
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    setSlots(prev => prev.filter(s => s.teacherId !== teacherId));
    toast({
      title: "Teacher Deleted",
      description: `${teacher.name} and all their slots have been removed.`,
      variant: "destructive",
    });
  };

  const scheduledSlots = useMemo(() => {
    return slots
      .filter(slot => slot.student)
      .map(slot => {
        const teacher = teachers.find(t => t.id === slot.teacherId);
        return { ...slot, teacher };
      });
  }, [slots, teachers]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="schedules">Scheduled Times</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-headline">Teacher Dashboard</h2>
              <Button onClick={() => setAddTeacherOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Teacher
              </Button>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map(teacher => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  slots={slots.filter(s => s.teacherId === teacher.id)}
                  onSchedule={handleScheduleSlot}
                  onDelete={handleDeleteSchedule}
                  onDeleteTeacher={handleDeleteTeacher}
                />
              ))}
              {teachers.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-10">
                  No teachers found. Add a new teacher to get started.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="schedules" className="mt-6">
            <ScheduledTimes schedules={scheduledSlots} teachers={teachers} />
          </TabsContent>
        </Tabs>
      </main>
      <AddTeacherDialog
        isOpen={isAddTeacherOpen}
        onOpenChange={setAddTeacherOpen}
        onAddTeacher={handleAddTeacher}
      />
    </div>
  );
}
