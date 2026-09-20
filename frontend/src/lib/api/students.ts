import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/students/schemas.py),
// keeping snake_case field names exactly as they appear over the wire.

export type StudentCreate = {
  first_name: string;
  last_name: string;
  graduation_year: number;
  sso_id?: number | null;
};

export type StudentUpdate = {
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  sso_id?: number | null;
};

export type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  graduation_year: number;
  sso_id: number | null;
  date_created: string | null;
  date_updated: string | null;
};

export function getAllStudents(): Promise<Student[]> {
  return request<Student[]>("/students/");
}

export function getStudent(studentId: number): Promise<Student> {
  return request<Student>(`/students/${studentId}`);
}

export function createStudent(data: StudentCreate): Promise<Student> {
  return request<Student>("/students/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStudent(studentId: number, data: StudentUpdate): Promise<Student> {
  return request<Student>(`/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteStudent(studentId: number): Promise<void> {
  return request<void>(`/students/${studentId}`, { method: "DELETE" });
}
