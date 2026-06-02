"use client";

import { socket } from "@/lib/socket";
import { Users, TrendingUp, Award, Calendar, Crown } from "lucide-react";
import { useEffect, useState } from "react";

type Stats = {
  totalStudents: number;
  avgCgpa: number;
  topCgpa: number;
  avgAge: number;
};

type TopPerformers = {
  name: string;
  cgpa: number;
  age: number;
  dept: string;
};

const DashboardClient = ({ stats, topPerformers}: { stats: Stats; topPerformers: TopPerformers[]}) => {
  const [newStats, setNewStats] = useState(stats);
  const [newTopPerformers, setNewPerformers] = useState(topPerformers);

  useEffect(() => {
    socket.on("dashboard-updated", async () => {
      const analytics = await fetch("http://localhost:5000/analytics").then(
        (r) => r.json(),
      );

      const performers = await fetch("http://localhost:5000/top-students").then(
        (r) => r.json(),
      );

      setNewStats(analytics);
      setNewPerformers(performers);
    });

    return () => {
      socket.off("dashboard-updated");
    };
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">
        Dashboard Analytics
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-zinc-500">Total Enrollment</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              {newStats?.totalStudents}
            </h2>
            <span className="text-sm text-zinc-400">students</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Active students</p>
        </div>

        {/* Average CGPA Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-zinc-500">Academic Performance</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              {newStats?.avgCgpa}
            </h2>
            <span className="text-sm text-zinc-400">/ 4.0</span>
          </div>
          <p className="text-xs text-green-400 mt-2">
            ↑ 0.12 from last semester
          </p>
        </div>

        {/* Top CGPA Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-xs text-zinc-500">Highest Achiever</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              {newStats?.topCgpa}
            </h2>
            <span className="text-sm text-zinc-400">/ 4.0</span>
          </div>
          <p className="text-xs text-yellow-400 mt-2">Top performing student</p>
        </div>

        {/* Average Age Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 hover:bg-zinc-900/70 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-zinc-500">Demographics</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-zinc-100">
              {newStats?.avgAge}
            </h2>
            <span className="text-sm text-zinc-400">years</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Average student age</p>
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Top Performers
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Based on CGPA</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  CGPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {newTopPerformers?.map((performer: TopPerformers, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="text-yellow-400">🥇</span>
                      )}
                      {index === 1 && <span className="text-gray-400">🥈</span>}
                      {index === 2 && (
                        <span className="text-amber-600">🥉</span>
                      )}
                      {index > 2 && (
                        <span className="text-zinc-500">#{index + 1}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {performer?.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-300">
                        {performer?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-zinc-400">
                      {performer?.dept}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-zinc-400">
                      {performer?.age}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-yellow-400">
                      {performer?.cgpa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${(performer?.cgpa / 4.0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400">
                        {Math.round((performer?.cgpa / 4.0) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
