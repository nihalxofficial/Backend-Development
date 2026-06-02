import DeleteStudent from "@/components/DeleteStudent";
import { getStudents } from "@/lib/students/data";
import { Student } from "@/types/student";
import { Button } from "@heroui/react";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";

export default async function StudentsPage() {
  const students = await getStudents();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Students List</h1>
        <Button
          variant="primary"
          className="bg-blue-600 hover:bg-blue-500 text-white "
        >
          <Link href="/add-student">Add New Student</Link>
        </Button>
      </div>

      {students.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">No students found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-zinc-900/50 rounded-lg overflow-hidden">
            <thead className="bg-zinc-800/50">
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {students.map((student: Student, index: number) => (
                <tr
                  key={student.id || index}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {student?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {student?.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {student?.dept}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {student?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {student?.cgpa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/students/${student?.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/students/${student?.id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Pencil size={18} />
                      </Link>
                      <DeleteStudent id={student?.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
