"use client";

import { addStudent } from "@/lib/students/action";
import { FloppyDisk } from "@gravity-ui/icons";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AddStudentPage() {
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      age: Number(formData.get("age")),
      email: formData.get("email") as string,
      dept: formData.get("dept") as string,
      cgpa: Number(formData.get("cgpa")),
    };

    const result = await addStudent(data);
    if(result){
        // Simulate API call
        toast.success("Student added successfully✅")
        router.push("/students");
    }
    
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Add New Student</h1>
      
      <Form className="w-full" onSubmit={onSubmit}>
        <Fieldset>
          <Fieldset.Legend>Student Information</Fieldset.Legend>
          <Description>Enter the student&apos;s details below.</Description>
          
          <FieldGroup>
            {/* Name Field */}
            <TextField
              isRequired
              name="name"
              validate={(value) => {
                if (value.length < 2) {
                  return "Name must be at least 2 characters";
                }
                return null;
              }}
            >
              <Label>Full Name</Label>
              <Input placeholder="Emily Chen" />
              <FieldError />
            </TextField>

            {/* Age Field */}
            <TextField
              isRequired
              name="age"
              type="number"
              validate={(value) => {
                const age = Number(value);
                if (isNaN(age) || age < 16 || age > 100) {
                  return "Age must be between 16 and 100";
                }
                return null;
              }}
            >
              <Label>Age</Label>
              <Input placeholder="20" type="number" />
              <Description>Must be between 16 and 100 years</Description>
              <FieldError />
            </TextField>

            {/* Email Field */}
            <TextField
              isRequired
              name="email"
              type="email"
              validate={(value) => {
                if (!value.includes("@") || !value.includes(".")) {
                  return "Please enter a valid email address";
                }
                return null;
              }}
            >
              <Label>Email</Label>
              <Input placeholder="emily@uni.com" />
              <FieldError />
            </TextField>

            {/* Department Field */}
            <TextField
              isRequired
              name="dept"
              validate={(value) => {
                if (value.length < 2) {
                  return "Department must be at least 2 characters";
                }
                return null;
              }}
            >
              <Label>Department</Label>
              <Input placeholder="ME (Mechanical Engineering)" />
              <Description>e.g., CS, ME, EE, CE</Description>
              <FieldError />
            </TextField>

            {/* CGPA Field */}
            <TextField
              isRequired
              name="cgpa"
              type="number"
              validate={(value) => {
                const cgpa = Number(value);
                if (isNaN(cgpa) || cgpa < 0 || cgpa > 4) {
                  return "CGPA must be between 0 and 4";
                }
                return null;
              }}
            >
              <Label>CGPA</Label>
              <Input placeholder="3.55" step="0.01" type="number" />
              <Description>Scale of 0.0 to 4.0</Description>
              <FieldError />
            </TextField>
          </FieldGroup>
          
          <Fieldset.Actions>
            <Button type="submit" variant="primary">
              <FloppyDisk />
              Add Student
            </Button>
            <Button type="reset" variant="secondary" onPress={() => router.push("/students")}>
              Cancel
            </Button>
          </Fieldset.Actions>
        </Fieldset>
      </Form>
    </div>
  );
}