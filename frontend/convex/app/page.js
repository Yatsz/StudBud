"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
  const students = useQuery(api.studentsData.get);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {students?.map(({ student_id, course }) => (
        <div key={student_id}>{course}</div>
      ))}
    </main>
  );
}
