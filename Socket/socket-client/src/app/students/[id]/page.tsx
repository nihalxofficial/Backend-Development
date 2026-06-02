import { getStudentById } from "@/lib/students/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { ArrowLeft, Mail, Calendar, BookOpen, Award, User } from "lucide-react";

const StudentDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const studentDetails = await getStudentById(id);

  if (!studentDetails) {
    notFound();
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/students">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-300 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Students
          </Button>
        </Link>
      </div>

      {/* Student Details Card */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 px-6 py-8 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-600/30 flex items-center justify-center ring-2 ring-blue-500/50">
              <span className="text-3xl font-bold text-blue-400">
                {studentDetails.name?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">
                {studentDetails.name}
              </h1>
              <p className="text-zinc-400 mt-1">
                Student ID: {studentDetails.id}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">
                Personal Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <User size={18} className="text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Full Name</p>
                    <p className="text-sm">{studentDetails.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-300">
                  <Mail size={18} className="text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Email Address</p>
                    <p className="text-sm">{studentDetails.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-300">
                  <Calendar size={18} className="text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Age</p>
                    <p className="text-sm">{studentDetails.age} years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-100 border-b border-zinc-800 pb-2">
                Academic Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-300">
                  <BookOpen size={18} className="text-purple-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Department</p>
                    <p className="text-sm">{studentDetails.dept}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-zinc-300">
                  <Award size={18} className="text-purple-400" />
                  <div>
                    <p className="text-xs text-zinc-500">CGPA</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-yellow-400">
                        {studentDetails.cgpa}
                      </p>
                      <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${(studentDetails.cgpa / 4.0) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-zinc-800 flex gap-3">
            <Button className="bg-yellow-600 hover:bg-yellow-500 text-white">
              <Link href={`/students/${studentDetails.id}/edit`}>
                Edit Student
              </Link>
            </Button>
            <Link href="/students">
              <Button variant="ghost" className="text-zinc-300">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsPage;
