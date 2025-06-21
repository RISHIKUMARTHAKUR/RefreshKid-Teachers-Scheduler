"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import type { Teacher, AvailabilitySlot } from '@/app/interfaces';
import { formatInTimezone } from '@/lib/time';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduledTimesProps {
  schedules: (AvailabilitySlot & { teacher?: Teacher })[];
  teachers: Teacher[];
}

export default function ScheduledTimes({ schedules, teachers }: ScheduledTimesProps) {
  const [filteredTeacherId, setFilteredTeacherId] = useState<string>('all');

  const filteredSchedules = schedules.filter(schedule => 
    filteredTeacherId === 'all' || schedule.teacherId === filteredTeacherId
  );
  
  const sortedSchedules = filteredSchedules.sort((a,b) => new Date(a.utcStartTime).getTime() - new Date(b.utcStartTime).getTime());

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <Select value={filteredTeacherId} onValueChange={setFilteredTeacherId}>
          <SelectTrigger className="w-full md:w-[280px]">
            <SelectValue placeholder="Filter by teacher..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teachers</SelectItem>
            {teachers.map(teacher => (
              <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableCaption>A list of all scheduled times.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Teacher's Time</TableHead>
              <TableHead>Student's Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSchedules.length > 0 ? (
              sortedSchedules.map(schedule => {
                const teacher = schedule.teacher;
                const student = schedule.student;
                
                return (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{teacher?.name || 'N/A'}</TableCell>
                    <TableCell>{teacher?.subject || 'N/A'}</TableCell>
                    <TableCell>{student?.name || 'N/A'}</TableCell>
                    <TableCell className="font-code">
                      {teacher && (
                        <div>
                          {formatInTimezone(schedule.utcStartTime, teacher.timezone)}
                          <span className="text-xs text-muted-foreground ml-2">({teacher.timezone})</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-code">
                      {student && (
                        <div>
                          {formatInTimezone(schedule.utcStartTime, student.timezone)}
                          <span className="text-xs text-muted-foreground ml-2">({student.timezone})</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No times scheduled yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
