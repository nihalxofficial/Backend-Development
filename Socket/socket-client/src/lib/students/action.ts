"use server"
const Api = typeof window === "undefined"
  ? process.env.API_URL
  : process.env.NEXT_PUBLIC_API_URL

import { revalidatePath } from "next/cache";

// const Api = process.env.NEXT_PUBLIC_API_URL


type Student = {
  name: string;
  email: string;
  age: number;
  dept: string;
  cgpa: number;
};

export const addStudent = async(student : Student)=>{
    const res = await fetch(`${Api}/students`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(student)
    })
    const data = await res.json();
    revalidatePath("/students")
    revalidatePath("/dashboard");
    return data;
}

export const updateStudent = async(student : Student, id: string)=>{
    const res = await fetch(`${Api}/students/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(student)
    })
    const data = await res.json();
    revalidatePath("/students")
    revalidatePath("/dashboard");
    return data;
}
export const deleteStudent = async(id: string)=>{
    const res = await fetch(`${Api}/students/${id}`, {
        method: "DELETE",
    })
    const data = await res.json();
    revalidatePath("/students");
    revalidatePath("/dashboard");
    return data;
}