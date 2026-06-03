const Api = typeof window === "undefined"
  ? process.env.API_URL
  : process.env.NEXT_PUBLIC_API_URL

// const Api = process.env.NEXT_PUBLIC_API_URL


export const getStudents = async()=> {
    const res = await fetch(`${Api}/students`,{
        cache: "no-store",
    });
    const students = await res.json();
    return students;
}

export const getStudentById = async(id : string)=> {
    const res = await fetch(`${Api}/students/${id}`,{
        cache: "no-store",
    });
    const student = await res.json();
    return student;
}

export const getAnalytics = async()=>{
    const res = await fetch(`${Api}/analytics`,{
        cache: "no-store"
    })
    const data = await res.json();
    return data;
}

export const getTopStudents = async()=>{
    const res = await fetch(`${Api}/top-students`,{
        cache: "no-store"
    })
    const data = await res.json();
    return data;
}