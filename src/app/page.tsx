"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Teacher, AvailabilitySlot, Student } from '@/app/interfaces';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Loader2 } from 'lucide-react';
import AddTeacherDialog from '@/components/AddTeacherDialog';
import TeacherCard from '@/components/TeacherCard';
import ScheduledTimes from '@/components/ScheduledTimes';
import Header from '@/components/Header';
import { useToast } from "@/hooks/use-toast";
import { database } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';

export default function Home() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isAddTeacherOpen, setAddTeacherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    let teachersDataReceived = false;
    let slotsDataReceived = false;

    const checkAndSetLoading = () => {
      if (teachersDataReceived && slotsDataReceived) {
        setIsLoading(false);
      }
    };

    const teachersRef = ref(database, 'teachers');
    const teachersUnsubscribe = onValue(teachersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teachersList: Teacher[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setTeachers(teachersList);
      } else {
        setTeachers([]);
      }
      teachersDataReceived = true;
      checkAndSetLoading();
    });

    const slotsRef = ref(database, 'slots');
    const slotsUnsubscribe = onValue(slotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const slotsList: AvailabilitySlot[] = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setSlots(slotsList);
      } else {
        setSlots([]);
      }
      slotsDataReceived = true;
      checkAndSetLoading();
    });

    return () => {
      teachersUnsubscribe();
      slotsUnsubscribe();
    };
  }, []);

  const handleAddTeacher = (teacher: Omit<Teacher, 'id'>, newSlots: Omit<AvailabilitySlot, 'id' | 'teacherId'>[]) => {
    const newTeacherRef = push(ref(database, 'teachers'));
    const newTeacherId = newTeacherRef.key;

    if (!newTeacherId) {
      toast({ title: "Error", description: "Could not create new teacher.", variant: "destructive" });
      return;
    }

    const newTeacher: Teacher = { ...teacher, id: newTeacherId };
    set(newTeacherRef, newTeacher);

    newSlots.forEach(slot => {
      const newSlotRef = push(ref(database, 'slots'));
      const newSlotId = newSlotRef.key;
      if (newSlotId) {
        const newSlotData: AvailabilitySlot = {
          ...slot,
          id: newSlotId,
          teacherId: newTeacherId,
        };
        set(newSlotRef, newSlotData);
      }
    });

    toast({
      title: "Teacher Added",
      description: `${newTeacher.name} has been added to the scheduler.`,
    });
  };

  const handleScheduleSlot = (slotId: string, student: Student) => {
    const studentRef = ref(database, `slots/${slotId}/student`);
    set(studentRef, student);
    toast({
      title: "Schedule Confirmed",
      description: `A new session has been scheduled.`,
    });
  };

  const handleDeleteSchedule = (slotId: string) => {
    const studentRef = ref(database, `slots/${slotId}/student`);
    remove(studentRef);
    toast({
      title: "Schedule Deleted",
      description: "The scheduled session has been removed.",
      variant: "destructive",
    });
  };

  const handleDeleteTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    remove(ref(database, `teachers/${teacherId}`));

    const slotsToDelete = slots.filter(s => s.teacherId === teacherId);
    slotsToDelete.forEach(slot => {
      remove(ref(database, `slots/${slot.id}`));
    });

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
  
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

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
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
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
                  {teachers.length === 0 && !isLoading && (
                    <p className="text-muted-foreground col-span-full text-center py-10">
                      No teachers found. Add a new teacher to get started.
                    </p>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="schedules" className="mt-6">
            {isLoading ? <LoadingSpinner /> : <ScheduledTimes schedules={scheduledSlots} teachers={teachers} />}
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
