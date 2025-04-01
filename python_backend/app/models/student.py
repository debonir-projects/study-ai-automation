from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    major = Column(String)
    academic_year = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    attendance = relationship("Attendance", back_populates="student")
    grades = relationship("Grade", back_populates="student")
    assignments = relationship("Assignment", back_populates="student")
    study_habits = relationship("StudyHabit", back_populates="student")
    performance_metrics = relationship("PerformanceMetric", back_populates="student")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime)
    status = Column(String)  # present, absent, late
    course_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="attendance")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(String)
    assignment_id = Column(String)
    score = Column(Float)
    max_score = Column(Float)
    grade_type = Column(String)  # quiz, exam, project, etc.
    date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="grades")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(String)
    title = Column(String)
    description = Column(String)
    due_date = Column(DateTime)
    status = Column(String)  # pending, submitted, graded
    submission_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="assignments")

class StudyHabit(Base):
    __tablename__ = "study_habits"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime)
    subject = Column(String)
    duration = Column(Integer)  # in minutes
    activity_type = Column(String)  # reading, practice, review, etc.
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="study_habits")

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime)
    metric_type = Column(String)  # overall, subject-specific, etc.
    value = Column(Float)
    metadata = Column(JSON)  # Additional metrics and context
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="performance_metrics") 