"use client";

import { updateStudent } from "@/lib/students/action";
import { Student } from "@/types/student";
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


export default function EditStudentForm({ student }: { student: Student }) {
  const router = useRouter();
  const id = student?.id;

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

    const result = await updateStudent(data, id)
    if(result){
        toast.success("Data updated");
        router.push("/students");
    }
  };

  return (
    <Form className="w-full " onSubmit={onSubmit}>
      <Fieldset>
        <Fieldset.Legend>Student Information</Fieldset.Legend>
        <Description>Update the student&apos;s details below.</Description>
        
        <FieldGroup>
          <TextField
            isRequired
            name="name"
            defaultValue={student.name}
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

          <TextField
            isRequired
            name="age"
            type="number"
            defaultValue={student.age.toString()}
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

          <TextField
            isRequired
            name="email"
            type="email"
            defaultValue={student.email}
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

          <TextField
            isRequired
            name="dept"
            defaultValue={student.dept}
            validate={(value) => {
              if (value.length < 2) {
                return "Department must be at least 2 characters";
              }
              return null;
            }}
          >
            <Label>Department</Label>
            <Input placeholder="ME" />
            <Description>e.g., CS, ME, EE, CE</Description>
            <FieldError />
          </TextField>

          <TextField
            isRequired
            name="cgpa"
            type="number"
            defaultValue={student.cgpa.toString()}
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
            Update Student
          </Button>
          <Button type="reset" variant="secondary" onPress={() => router.push("/students")}>
            Cancel
          </Button>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}