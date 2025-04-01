from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.services.report_generator import ReportGenerator
from app.services.performance_analyzer import PerformanceAnalyzer
from app.models.student import Student
from app.core.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime

router = APIRouter()
report_generator = ReportGenerator()
analyzer = PerformanceAnalyzer()

@router.get("/student/{student_id}/full-report")
async def generate_full_report(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Generate a comprehensive performance report for a student."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Prepare student data
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
        
        # Generate report
        report = report_generator.generate_report(student_data, analysis_results)
        
        return {
            'student_info': {
                'id': student.student_id,
                'name': student.name,
                'major': student.major,
                'academic_year': student.academic_year
            },
            'report': report
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/summary-report")
async def generate_summary_report(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Generate a concise summary report for a student."""
    try:
        # Fetch student data
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Prepare student data
        student_data = {
            'student_id': student.student_id,
            'name': student.name,
            'major': student.major,
            'academic_year': student.academic_year,
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
            ]
        }
        
        # Analyze performance
        analysis_results = analyzer.analyze_performance(student_data)
        
        # Generate summary report
        summary_report = report_generator.generate_summary_report(student_data, analysis_results)
        
        return {
            'student_id': student_id,
            'summary_report': summary_report
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/recommendations-report")
async def generate_recommendations_report(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Generate a focused report on recommendations for a student."""
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
        
        # Analyze performance
        analysis_results = analyzer.analyze_performance(student_data)
        
        # Generate recommendations report
        recommendations_report = report_generator.generate_recommendations_report(analysis_results)
        
        return {
            'student_id': student_id,
            'recommendations_report': recommendations_report
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student/{student_id}/visualizations")
async def get_report_visualizations(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get visualizations for a student's performance report."""
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
        
        # Analyze performance
        analysis_results = analyzer.analyze_performance(student_data)
        
        # Generate report to get visualizations
        report = report_generator.generate_report(student_data, analysis_results)
        
        return {
            'student_id': student_id,
            'visualizations': report['visualizations']
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 