export type Student = {
  id: string;
  name: string;
  email: string;
  age: number;
  dept: string;
  cgpa: number;
};

export type CreateStudent = Omit<Student, "id">;

export type UpdateStudent = Partial<CreateStudent>;