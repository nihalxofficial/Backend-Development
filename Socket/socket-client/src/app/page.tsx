import Link from "next/link";
import { Button } from "@heroui/react";
import { Users, GraduationCap, BarChart3, PlusCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 mb-6">
              Student Management
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                {" "}System
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              Effortlessly manage students, track academic performance, and access analytics all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/students">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white">
                  View Students
                </Button>
              </Link>
              <Link href="/add-student">
                <Button size="lg" variant="ghost" className="text-zinc-300">
                  Add Student
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
            <div className="p-2 bg-blue-500/10 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Manage Students</h3>
            <p className="text-sm text-zinc-400">
              View, add, edit, and delete student records with ease.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
            <div className="p-2 bg-green-500/10 rounded-lg w-fit mb-4">
              <GraduationCap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Track Performance</h3>
            <p className="text-sm text-zinc-400">
              Monitor CGPA and academic progress of each student.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
            <div className="p-2 bg-purple-500/10 rounded-lg w-fit mb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Analytics</h3>
            <p className="text-sm text-zinc-400">
              Get insights with detailed analytics and reports.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
            <div className="p-2 bg-yellow-500/10 rounded-lg w-fit mb-4">
              <PlusCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Quick Add</h3>
            <p className="text-sm text-zinc-400">
              Easily add new students with our simple form.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">Ready to get started?</h2>
          <p className="text-zinc-400 mb-6">
            Begin managing your students efficiently today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/students">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Browse Students
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="text-zinc-300">
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}