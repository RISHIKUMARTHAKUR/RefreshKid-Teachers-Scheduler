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
import { Clock, PlusCircle, Trash2 } from 'lucide-react';
import { Teacher, AvailabilitySlot } from '@/app/interfaces';
import { toUTC, timezoneKeys, timezoneLabels, formatInTimezone, daysOfWeek } from '@/lib/time';
import type { Timezone } from '@/lib/time';

type NewSlot = Omit<AvailabilitySlot, 'id' | 'teacherId' | 'student'>;

interface AddTeacherDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id'>, slots: NewSlot[]) => void;
}

export default function AddTeacherDialog({ isOpen, onOpenChange, onAddTeacher }: AddTeacherDialogProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherTimezone, setTeacherTimezone] = useState<Timezone>('EST');
  const [slots, setSlots] = useState<NewSlot[]>([]);
  
  const [slotDay, setSlotDay] = useState(1); // Default to Monday
  const [slotTime, setSlotTime] = useState('09:00');
  const [slotTimezone, setSlotTimezone] = useState<Timezone>('EST');

  const handleAddSlot = () => {
    if (slotTime) {
      const utcStartTime = toUTC(slotDay, slotTime, slotTimezone);
      setSlots([...slots, { utcStartTime }]);
    }
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (name && subject && teacherTimezone) {
      onAddTeacher({ name, subject, timezone: teacherTimezone }, slots);
      // Reset form
      setName('');
      setSubject('');
      setTeacherTimezone('EST');
      setSlots([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter teacher details and their available time slots.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">Subject</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timezone" className="text-right">Primary Timezone</Label>
            <Select value={teacherTimezone} onValueChange={(v: Timezone) => setTeacherTimezone(v)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneKeys.map(tz => <SelectItem key={tz} value={tz}>{timezoneLabels[tz]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Add Availability Slots</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Day of the Week</Label>
                <Select value={String(slotDay)} onValueChange={(v) => setSlotDay(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day, index) => (
                      <SelectItem key={index} value={String(index)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={slotTime} onChange={e => setSlotTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Timezone of Input</Label>
                <Select value={slotTimezone} onValueChange={(v: Timezone) => setSlotTimezone(v)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {timezoneKeys.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSlot} variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Slot
              </Button>
            </div>
          </div>

          {slots.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold">Added Slots:</h4>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {slots.map((slot, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatInTimezone(slot.utcStartTime, teacherTimezone)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSlot(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!name || !subject}>Save Teacher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
