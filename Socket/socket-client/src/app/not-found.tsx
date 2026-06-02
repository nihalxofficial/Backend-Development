import Link from "next/link";
import { Button } from "@heroui/react";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800 px-4">
      <div className="text-center max-w-md">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl font-bold text-zinc-800">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
              404
            </div>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-zinc-800/50 rounded-full border border-zinc-700">
            <Search className="w-12 h-12 text-zinc-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-zinc-400 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/students">
            <Button variant="ghost" className="text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Students
            </Button>
          </Link>
        </div>

        {/* Additional Help Text */}
        <p className="text-xs text-zinc-500 mt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}