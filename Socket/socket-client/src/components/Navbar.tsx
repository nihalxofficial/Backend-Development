"use client";
import { authClient } from "@/lib/auth-client";
import { Avatar, Button } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <p className="font-bold text-zinc-100">StudentHub</p>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center gap-6">
          <li>
            <Link
              href="/"
              className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/students"
              className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              href="/add-student"
              className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Add Student
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Dashboard
            </Link>
          </li>
        </ul>

        {/* Loading Skeleton */}
        {isPending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />
            <div className="hidden sm:block">
              <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse" />
              <div className="h-3 w-16 bg-zinc-700 rounded mt-1 animate-pulse" />
            </div>
          </div>
        )}

        {/* Not Logged In */}
        {!isPending && !user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-zinc-300">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}

        {/* Logged In */}
        {!isPending && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="md" className="ring-2 ring-blue-500/20">
                <Avatar.Image
                  alt={user?.name || "User avatar"}
                  src="https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745"
                />
                <Avatar.Fallback>{user?.name?.charAt(0) || "U"}</Avatar.Fallback>
              </Avatar>
              <div className="hidden sm:block">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Welcome Back
                </h2>
                <p className="text-xs text-zinc-400">{user?.name}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSignOut}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;