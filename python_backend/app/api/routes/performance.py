from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.services.performance_analyzer import PerformanceAnalyzer
from app.models.student import Student
from app.core.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

router = APIRouter()
analyzer = PerformanceAnalyzer()

@router.get("/student/{student_id}")
async def get_student_performance(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get comprehensive performance analysis for a student."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Prepare student data for analysis
        student_data = {
            'student_id': student.student_id,
            'name': student.name,
            'major': student.major,
            'academic_year': student.academic_year,
            'grades': [
                {
                    'course_id': grade.course_id,
                    'score': grade.score,
                    'max_score': grade.max_score,
                    'grade_type': grade.grade_type,
                    'date': grade.date.isoformat()
                }
                for grade in student.grades
            ],
            'attendance': [
                {
                    'date': attendance.date.isoformat(),
                    'status': attendance.status,
                    'course_id': attendance.course_id
                }
                for attendance in student.attendance
            ],
            'assignments': [
                {
                    'course_id': assignment.course_id,
                    'title': assignment.title,
                    'status': assignment.status,
                    'submission_date': assignment.submission_date.isoformat() if assignment.submission_date else None
                }
                for assignment in student.assignments
            ],
            'study_habits': [
                {
                    'date': habit.date.isoformat(),
                    'subject': habit.subject,
                    'duration': habit.duration,
                    'activity_type': habit.activity_type,
                    'notes': habit.notes
                }
                for habit in student.study_habits
            ],
            'performance_metrics': [
                {
                    'date': metric.date.isoformat(),
                    'metric_type': metric.metric_type,
                    'value': metric.value,
                    'metadata': metric.metadata
                }
                for metric in student.performance_metrics
            ]
        }
        
        # Analyze performance
        analysis_results = analyzer.analyze_performance(student_data)
        
        return {
            'student_info': {
                'id': student.student_id,
                'name': student.name,
                'major': student.major,
                'academic_year': student.academic_year
            },
            'analysis': analysis_results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/predictions")
async def get_student_predictions(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get performance predictions for a student."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Prepare student data
        student_data = {
            'grades': [
                {
                    'course_id': grade.course_id,
                    'score': grade.score,
                    'date': grade.date.isoformat()
                }
                for grade in student.grades
            ],
            'attendance': [
                {
                    'date': attendance.date.isoformat(),
                    'status': attendance.status
                }
                for attendance in student.attendance
            ],
            'study_habits': [
                {
                    'date': habit.date.isoformat(),
                    'duration': habit.duration,
                    'activity_type': habit.activity_type
                }
                for habit in student.study_habits
            ],
            'performance_metrics': [
                {
                    'date': metric.date.isoformat(),
                    'value': metric.value
                }
                for metric in student.performance_metrics
            ]
        }
        
        # Analyze performance and get predictions
        analysis_results = analyzer.analyze_performance(student_data)
        
        return {
            'student_id': student_id,
            'predictions': analysis_results['predictions']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/improvement-areas")
async def get_improvement_areas(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get identified improvement areas for a student."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Prepare student data
        student_data = {
            'grades': [
                {
                    'course_id': grade.course_id,
                    'score': grade.score,
                    'date': grade.date.isoformat()
                }
                for grade in student.grades
            ],
            'attendance': [
                {
                    'date': attendance.date.isoformat(),
                    'status': attendance.status
                }
                for attendance in student.attendance
            ],
            'study_habits': [
                {
                    'date': habit.date.isoformat(),
                    'subject': habit.subject,
                    'duration': habit.duration,
                    'activity_type': habit.activity_type
                }
                for habit in student.study_habits
            ]
        }
        
        # Analyze performance and get improvement areas
        analysis_results = analyzer.analyze_performance(student_data)
        
        return {
            'student_id': student_id,
            'improvement_areas': analysis_results['improvement_areas']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/trends")
async def get_performance_trends(
    student_id: str,
    period: str = "semester",  # semester, year, all
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get performance trends for a student over a specified period."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Calculate date range based on period
        end_date = datetime.utcnow()
        if period == "semester":
            start_date = end_date - timedelta(days=90)
        elif period == "year":
            start_date = end_date - timedelta(days=365)
        else:
            start_date = student.created_at
        
        # Prepare student data
        student_data = {
            'grades': [
                {
                    'course_id': grade.course_id,
                    'score': grade.score,
                    'date': grade.date.isoformat()
                }
                for grade in student.grades
                if start_date <= grade.date <= end_date
            ],
            'attendance': [
                {
                    'date': attendance.date.isoformat(),
                    'status': attendance.status
                }
                for attendance in student.attendance
                if start_date <= attendance.date <= end_date
            ],
            'study_habits': [
                {
                    'date': habit.date.isoformat(),
                    'duration': habit.duration,
                    'activity_type': habit.activity_type
                }
                for habit in student.study_habits
                if start_date <= habit.date <= end_date
            ]
        }
        
        # Analyze performance and get trends
        analysis_results = analyzer.analyze_performance(student_data)
        
        return {
            'student_id': student_id,
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'trends': {
                'grade_trend': analysis_results['overall_performance']['grade_trend'],
                'attendance_trend': analysis_results['attendance_analysis']['trend'],
                'subject_trends': {
                    subject: data['trend']
                    for subject, data in analysis_results['subject_performance'].items()
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 