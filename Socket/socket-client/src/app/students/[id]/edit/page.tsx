import EditStudentForm from '@/components/EditStudentForm';
import { getStudentById } from '@/lib/students/data';

const EditStudentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const student = await getStudentById(id);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Edit Student</h1>
      <EditStudentForm student={student} />
    </div>
  );
};

export default EditStudentPage;