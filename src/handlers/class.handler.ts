import { Response } from "express";
import { ClassRepository, classRepository } from "../repositories/class.repository.js";
import { StudentRepository, studentRepository } from "../repositories/student.repository.js";
import { GradeRepository, gradeRepository } from "../repositories/grade.repository.js";
import { AuthRequest } from "../middleware/auth.js";
import { CreateClassDto, UpdateClassDto, EnrollStudentDto } from "../dto/class.dto.js";

export class ClassHandler {
  constructor(
    private classRepo: ClassRepository = classRepository,
    private studentRepo: StudentRepository = studentRepository,
    private gradeRepo: GradeRepository = gradeRepository
  ) {}

  getClasses = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classes = this.classRepo.findAllByLecturerId(lecturerId);
    res.json({ classes });
  };

  createClass = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const data = req.body as CreateClassDto;

    const classId = this.classRepo.create({
      lecturerId,
      code: data.code,
      title: data.title,
      sks: data.sks,
      prodi: data.prodi,
      semester: data.semester,
      capacity: data.capacity,
      schedule: data.schedule,
      room: data.room,
    });

    res.status(201).json({
      message: "Kelas berhasil dibuat.",
      classId,
    });
  };

  getClassDetail = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.id);

    const classData = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classData) {
      res.status(404).json({ error: "Kelas tidak ditemukan atau Anda tidak memiliki akses." });
      return;
    }

    const students = this.studentRepo.findEnrolledByClassId(classId);
    res.json({ class: classData, students });
  };

  enrollStudent = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.id);
    const { nim, name, email, prodi } = req.body as EnrollStudentDto;

    const classCheck = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!classCheck) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    const studentId = this.studentRepo.upsert({
      nim,
      name,
      email: email || `${nim}@student.kampus.ac.id`,
      prodi: prodi || classCheck.prodi,
      status: "Aktif",
    });

    const existingEnrollment = this.studentRepo.findEnrollment(classId, studentId);
    if (existingEnrollment) {
      res.status(400).json({ error: "Mahasiswa ini sudah terdaftar di kelas." });
      return;
    }

    const enrollmentId = this.studentRepo.enrollStudent(classId, studentId);
    this.gradeRepo.initEmptyGrade(enrollmentId);

    res.status(201).json({
      message: "Mahasiswa berhasil ditambahkan ke kelas.",
      enrollmentId,
    });
  };

  updateClass = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.id);

    const isOwner = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!isOwner) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    this.classRepo.update(classId, lecturerId, req.body as UpdateClassDto);
    res.json({ message: "Detail kelas berhasil diperbarui." });
  };

  deleteClass = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.id);

    const isOwner = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!isOwner) {
      res.status(403).json({ error: "Akses ditolak atau kelas tidak ditemukan." });
      return;
    }

    this.classRepo.delete(classId, lecturerId);
    res.json({ message: "Kelas berhasil dihapus." });
  };

  unenrollStudent = (req: AuthRequest, res: Response): void => {
    const lecturerId = req.user!.id;
    const classId = Number(req.params.classId);
    const studentId = Number(req.params.studentId);

    const isOwner = this.classRepo.findByIdAndLecturerId(classId, lecturerId);
    if (!isOwner) {
      res.status(403).json({ error: "Akses ditolak." });
      return;
    }

    this.studentRepo.unenrollStudent(classId, studentId);
    res.json({ message: "Mahasiswa berhasil dikeluarkan dari kelas." });
  };
}

export const classHandler = new ClassHandler();

