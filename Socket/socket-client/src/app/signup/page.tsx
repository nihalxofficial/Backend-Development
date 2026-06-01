"use client";

import { useState } from "react";
import { PersonPlus, EyeSlash, Eye } from "@gravity-ui/icons";
import { Button, Checkbox, Link, Form, Input } from "@heroui/react";

export default function SignupPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        {/* Card container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          
          {/* Header section */}
          <div className="px-6 pt-6 pb-4 border-b border-zinc-800/60 text-center">
            <div className="flex items-center gap-2 justify-center mb-2">
              <div className="p-1.5 bg-blue-500/10 rounded-full">
                <PersonPlus className="h-5 w-5 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-zinc-100">Create an Account</h1>
            </div>
            <p className="text-xs text-zinc-400">
              Join us today and start your journey
            </p>
          </div>

          {/* Form section */}
          <div className="px-6 py-5">
            <Form className="w-full flex flex-col gap-3">
              
              {/* Full Name */}
              <Input
                name="fullName"
                type="text"
                placeholder="Full Name"
                className="w-full"
              />

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

              {/* Confirm Password */}
              <Input
                name="confirmPassword"
                placeholder="Confirm Password"
                type={isConfirmVisible ? "text" : "password"}
                className="w-full"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleConfirmVisibility}
                    aria-label="toggle confirm password visibility"
                  >
                    {isConfirmVisible ? (
                      <EyeSlash className="h-4 w-4 text-zinc-400 hover:text-zinc-200" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400 hover:text-zinc-200" />
                    )}
                  </button>
                }
              />

              {/* Form Action Section */}
              <div className="flex flex-col gap-2 mt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold h-10 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                  size="sm"
                >
                  <PersonPlus className="h-4 w-4" />
                  Sign Up
                </Button>
                
                <div className="text-center text-xs text-zinc-400">
                  Already have an account?{" "}
                  <Link href="#" className="text-xs text-blue-400 font-medium hover:underline">
                    Sign in
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