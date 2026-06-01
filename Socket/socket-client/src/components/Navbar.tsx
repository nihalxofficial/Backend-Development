import { Avatar, Button } from "@heroui/react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <p className="font-bold text-zinc-100">Socket</p>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center gap-6">
          <li>
            <Link href="/" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/students" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
              Students
            </Link>
          </li>
          <li>
            <Link href="/add-student" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
              Add Student
            </Link>
          </li>
        </ul>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-zinc-300">
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
         {/* <nav className="flex items-center gap-3 px-6 py-3 bg-zinc-900/50 border-b border-zinc-800">
        <Avatar size="md" className="ring-2 ring-blue-500/20">
          <Avatar.Image
            alt="John Doe"
            src="https://img.heroui.chat/image/avatar?w=400&h=400&u=3"
          />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Welcome Back</h2>
          <p className="text-xs text-zinc-400">John Doe</p>
        </div>
      </nav> */}
      </div>
    </nav>
  );
};

export default Navbar;