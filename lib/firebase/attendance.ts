import { db } from "./config"
import { collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { addPoints } from "./wallet"

export interface AttendanceSession {
  id?: string
  code: string
  teacherId: string
  createdAt: any // Timestamp
  expiresAt: any // Timestamp
  isActive: boolean
}

export async function createAttendanceSession(teacherId: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes

  const session: AttendanceSession = {
    code,
    teacherId,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(expiresAt),
    isActive: true
  }

  await addDoc(collection(db, "attendance_sessions"), session)
  return code
}

export async function markAttendance(studentId: string, email: string, rollNumber: string, code: string): Promise<{ success: boolean; message: string }> {
  // Find active session with this code
  const q = query(
    collection(db, "attendance_sessions"),
    where("code", "==", code),
    where("isActive", "==", true)
  )
  
  const querySnapshot = await getDocs(q)
  
  if (querySnapshot.empty) {
    return { success: false, message: "Invalid or expired code." }
  }

  const sessionDoc = querySnapshot.docs[0]
  const session = sessionDoc.data() as AttendanceSession
  
  // Check expiration
  const now = Timestamp.now()
  if (now.toMillis() > session.expiresAt.toMillis()) {
    return { success: false, message: "Code has expired." }
  }

  // Check if already marked
  const attendanceRef = doc(db, "attendance_records", `${sessionDoc.id}_${studentId}`)
  const attendanceDoc = await getDoc(attendanceRef)
  
  if (attendanceDoc.exists()) {
    return { success: false, message: "Attendance already marked for this session." }
  }

  // Check for 1 hour cooldown
  // Note: Fetching all records for student to avoid composite index requirement
  const lastAttendanceQuery = query(
    collection(db, "attendance_records"),
    where("studentId", "==", studentId)
  )
  const lastAttendanceSnapshot = await getDocs(lastAttendanceQuery)
  
  if (!lastAttendanceSnapshot.empty) {
    const records = lastAttendanceSnapshot.docs.map(doc => doc.data())
    // Sort in memory to find the latest
    records.sort((a, b) => b.markedAt.toMillis() - a.markedAt.toMillis())
    
    const lastAttendance = records[0]
    const lastMarkedAt = lastAttendance.markedAt.toDate()
    const timeDiff = now.toDate().getTime() - lastMarkedAt.getTime()
    const oneHour = 60 * 60 * 1000
    
    if (timeDiff < oneHour) {
      const minutesLeft = Math.ceil((oneHour - timeDiff) / (60 * 1000))
      return { success: false, message: `Please wait ${minutesLeft} minutes before marking attendance again.` }
    }
  }

  // Mark attendance
  await setDoc(attendanceRef, {
    sessionId: sessionDoc.id,
    studentId,
    studentEmail: email,
    studentRollNumber: rollNumber,
    markedAt: now,
    status: "present"
  })

  // Award points
  try {
    await addPoints(studentId, 50, "Class Attendance")
  } catch (error) {
    console.error("Failed to award points for attendance:", error)
  }

  return { success: true, message: "Attendance marked successfully! +50 Points" }
}

export interface AttendanceRecord {
  sessionId: string
  studentId: string
  studentEmail?: string
  studentRollNumber?: string
  markedAt: any
  status: string
}

export async function getTeacherSessions(teacherId: string): Promise<AttendanceSession[]> {
  // Fetch sessions without ordering to avoid composite index requirement
  const q = query(
    collection(db, "attendance_sessions"),
    where("teacherId", "==", teacherId)
  )
  
  const querySnapshot = await getDocs(q)
  const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceSession))
  
  // Sort in memory
  return sessions.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
}

export async function getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
  // Fetch records without ordering to avoid composite index requirement
  const q = query(
    collection(db, "attendance_records"),
    where("sessionId", "==", sessionId)
  )
  
  const querySnapshot = await getDocs(q)
  const records = querySnapshot.docs.map(doc => doc.data() as AttendanceRecord)
  
  // Sort in memory
  return records.sort((a, b) => b.markedAt.toMillis() - a.markedAt.toMillis())
}

export async function getStudentWeeklyAttendance(studentId: string): Promise<AttendanceRecord[]> {
  // Fetch all records for the student (avoiding complex index requirements)
  const q = query(
    collection(db, "attendance_records"),
    where("studentId", "==", studentId)
  )

  const querySnapshot = await getDocs(q)
  const records = querySnapshot.docs.map(doc => doc.data() as AttendanceRecord)
  
  // Filter for current week (Mon-Sun) in memory
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 (Sun) - 6 (Sat)
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  
  return records.filter(record => record.markedAt.toDate() >= monday)
}
