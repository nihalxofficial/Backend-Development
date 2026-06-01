"use client";

import { useState } from "react";
import { Person, EyeSlash, Eye } from "@gravity-ui/icons";
import { Button, Checkbox, Link, Form, Input } from "@heroui/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const userData = Object.fromEntries(formData.entries());
  
      const { data, error } = await authClient.signIn.email({
        email: userData.email as string,
        password: userData.password as string,
      });
      if(data){
        toast.success("Login successful 🎉")
        console.log(data);
        router.push("/")
      }
      if(error){
        toast.error(error.message)
        console.log(error);
      }
    }

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Card container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          
          {/* Header section */}
          <div className="px-6 pt-6 pb-4 border-b border-zinc-800/60 text-center">
            <div className="flex items-center gap-2 justify-center mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded-full">
                <Person className="h-5 w-5 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">Welcome Back</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form section */}
          <div className="px-6 py-5">
            <Form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
              
              {/* Email */}
              <Input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full"
              />

              {/* Password */}
              <Input
                name="password"
                placeholder="Password"
                type={isVisible ? "text" : "password"}
                className="w-full"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                    aria-label="toggle password visibility"
                  >
                    {isVisible ? (
                      <EyeSlash className="h-4 w-4 text-zinc-400 hover:text-zinc-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400 hover:text-zinc-200" />
                    )}
                  </button>
                }
              />

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between mt-1">
                <Checkbox name="remember" size="sm" radius="sm" color="primary">
                  <span className="text-xs text-zinc-400 select-none ml-1">
                    Remember me
                  </span>
                </Checkbox>
                <Link href="#" className="text-xs text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Form Action Section */}
              <div className="flex flex-col gap-2 mt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  size="sm"
                >
                  <Person className="h-4 w-4" />
                  Sign In
                </Button>
                
                <div className="text-center text-xs text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link href="#" className="text-xs text-blue-400 font-medium hover:underline">
                    Sign up
                  </Link>
                </div>
              </div>

            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}