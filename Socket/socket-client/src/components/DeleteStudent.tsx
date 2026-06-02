"use client"
import { deleteStudent } from "@/lib/students/action";
import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

// type DeleteStudentProps = {
//   id: string;
// };

const DeleteStudent = ({ id }: { id: string }) => {
  const handleDelete = async () => {
    const data = await deleteStudent(id);
    if(data){
        toast.warning("Student deleted");
    }
  };
  return (
    <Button onClick={handleDelete} variant="ghost" className="text-red-400 hover:text-red-300">
      <Trash2 size={18} />
    </Button>
  );
};

export default DeleteStudent;
