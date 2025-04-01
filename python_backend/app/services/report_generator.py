import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import json
from datetime import datetime, timedelta
import os
from jinja2 import Environment, FileSystemLoader
import pdfkit
from io import BytesIO
import base64
import plotly.graph_objects as go
import plotly.express as px
from app.services.performance_analyzer import PerformanceAnalyzer

class ReportGenerator:
    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader('templates')
        )
        self.setup_styles()
        self.analyzer = PerformanceAnalyzer()

    def setup_styles(self):
        """Set up matplotlib and seaborn styles."""
        plt.style.use('seaborn')
        sns.set_palette("husl")
        
        # Configure matplotlib for better quality
        plt.rcParams['figure.figsize'] = [10, 6]
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 300

    def generate_report(self, student_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive performance report."""
        # Calculate overall statistics
        overall_stats = self._calculate_overall_stats(student_data)
        
        # Generate visualizations
        visualizations = self._generate_visualizations(student_data, analysis_results)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(analysis_results)
        
        return {
            'overall_stats': overall_stats,
            'visualizations': visualizations,
            'recommendations': recommendations,
            'analysis_results': analysis_results
        }

    def _calculate_overall_stats(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall performance statistics."""
        grades = pd.DataFrame(student_data['grades'])
        attendance = pd.DataFrame(student_data['attendance'])
        study_habits = pd.DataFrame(student_data['study_habits'])
        
        # Calculate grade statistics
        grade_stats = {
            'average_score': grades['score'].mean(),
            'highest_score': grades['score'].max(),
            'lowest_score': grades['score'].min(),
            'total_assignments': len(grades),
            'completed_assignments': len(grades[grades['score'].notna()])
        }
        
        # Calculate attendance statistics
        attendance_stats = {
            'total_sessions': len(attendance),
            'attended_sessions': len(attendance[attendance['status'] == 'present']),
            'attendance_rate': len(attendance[attendance['status'] == 'present']) / len(attendance) if len(attendance) > 0 else 0
        }
        
        # Calculate study habits statistics
        study_stats = {
            'total_study_hours': study_habits['duration'].sum(),
            'average_daily_hours': study_habits.groupby(study_habits['date'].dt.date)['duration'].sum().mean(),
            'most_common_subject': study_habits['subject'].mode().iloc[0] if not study_habits.empty else None
        }
        
        return {
            'grade_stats': grade_stats,
            'attendance_stats': attendance_stats,
            'study_stats': study_stats
        }

    def _generate_visualizations(self, student_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive visualizations."""
        grades = pd.DataFrame(student_data['grades'])
        attendance = pd.DataFrame(student_data['attendance'])
        study_habits = pd.DataFrame(student_data['study_habits'])
        
        # Grade trend visualization
        grade_trend = self._create_grade_trend_plot(grades)
        
        # Attendance pattern visualization
        attendance_pattern = self._create_attendance_pattern_plot(attendance)
        
        # Study habits visualization
        study_habits_plot = self._create_study_habits_plot(study_habits)
        
        # Performance distribution visualization
        performance_dist = self._create_performance_distribution_plot(grades)
        
        return {
            'grade_trend': grade_trend,
            'attendance_pattern': attendance_pattern,
            'study_habits': study_habits_plot,
            'performance_distribution': performance_dist
        }

    def _generate_recommendations(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate recommendations based on analysis results."""
        recommendations = []
        
        # Analyze grade patterns
        if 'grade_patterns' in analysis_results:
            for pattern in analysis_results['grade_patterns']:
                if pattern['trend'] == 'declining':
                    recommendations.append({
                        'type': 'academic',
                        'priority': 'high',
                        'description': f"Your grades in {pattern['subject']} are showing a declining trend. Consider seeking additional help or reviewing your study strategies.",
                        'action_items': [
                            "Schedule a meeting with your professor",
                            "Join a study group",
                            "Review past assignments and identify areas for improvement"
                        ]
                    })
        
        # Analyze attendance patterns
        if 'attendance_patterns' in analysis_results:
            for pattern in analysis_results['attendance_patterns']:
                if pattern['attendance_rate'] < 0.8:
                    recommendations.append({
                        'type': 'attendance',
                        'priority': 'medium',
                        'description': f"Your attendance rate in {pattern['subject']} is below 80%. Regular attendance is crucial for academic success.",
                        'action_items': [
                            "Set up attendance reminders",
                            "Review missed class materials",
                            "Communicate with classmates about missed content"
                        ]
                    })
        
        return recommendations

    def _create_grade_trend_plot(self, grades: pd.DataFrame) -> Dict[str, Any]:
        """Create a grade trend visualization."""
        if grades.empty:
            return None
        
        fig = go.Figure()
        
        for course_id in grades['course_id'].unique():
            course_grades = grades[grades['course_id'] == course_id]
            fig.add_trace(go.Scatter(
                x=course_grades['date'],
                y=course_grades['score'],
                name=course_id,
                mode='lines+markers'
            ))
        
        fig.update_layout(
            title='Grade Trends by Course',
            xaxis_title='Date',
            yaxis_title='Score',
            showlegend=True
        )
        
        return fig.to_dict()

    def _create_attendance_pattern_plot(self, attendance: pd.DataFrame) -> Dict[str, Any]:
        """Create an attendance pattern visualization."""
        if attendance.empty:
            return None
        
        attendance_by_course = attendance.groupby('course_id')['status'].value_counts(normalize=True).unstack()
        
        fig = go.Figure(data=[
            go.Bar(name=status, x=attendance_by_course.index, y=attendance_by_course[status])
            for status in attendance_by_course.columns
        ])
        
        fig.update_layout(
            title='Attendance Patterns by Course',
            xaxis_title='Course',
            yaxis_title='Percentage',
            barmode='stack'
        )
        
        return fig.to_dict()

    def _create_study_habits_plot(self, study_habits: pd.DataFrame) -> Dict[str, Any]:
        """Create a study habits visualization."""
        if study_habits.empty:
            return None
        
        study_by_subject = study_habits.groupby('subject')['duration'].sum()
        
        fig = go.Figure(data=[
            go.Pie(labels=study_by_subject.index, values=study_by_subject.values)
        ])
        
        fig.update_layout(
            title='Study Time Distribution by Subject'
        )
        
        return fig.to_dict()

    def _create_performance_distribution_plot(self, grades: pd.DataFrame) -> Dict[str, Any]:
        """Create a performance distribution visualization."""
        if grades.empty:
            return None
        
        fig = go.Figure(data=[
            go.Histogram(x=grades['score'], nbinsx=10)
        ])
        
        fig.update_layout(
            title='Grade Distribution',
            xaxis_title='Score',
            yaxis_title='Frequency'
        )
        
        return fig.to_dict()

    def generate_summary_report(self, student_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a concise summary report."""
        # Calculate key metrics
        key_metrics = self._calculate_key_metrics(student_data)
        
        # Generate summary visualizations
        summary_visualizations = self._generate_summary_visualizations(student_data)
        
        return {
            'key_metrics': key_metrics,
            'visualizations': summary_visualizations,
            'summary': analysis_results.get('summary', {})
        }

    def _calculate_key_metrics(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate key performance metrics."""
        grades = pd.DataFrame(student_data['grades'])
        attendance = pd.DataFrame(student_data['attendance'])
        
        # Calculate GPA
        gpa = grades['score'].mean() if not grades.empty else 0
        
        # Calculate attendance rate
        attendance_rate = len(attendance[attendance['status'] == 'present']) / len(attendance) if len(attendance) > 0 else 0
        
        # Calculate completion rate
        completion_rate = len(grades[grades['score'].notna()]) / len(grades) if len(grades) > 0 else 0
        
        return {
            'gpa': gpa,
            'attendance_rate': attendance_rate,
            'completion_rate': completion_rate
        }

    def _generate_summary_visualizations(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary visualizations."""
        grades = pd.DataFrame(student_data['grades'])
        attendance = pd.DataFrame(student_data['attendance'])
        
        # Grade summary visualization
        grade_summary = self._create_grade_summary_plot(grades)
        
        # Attendance summary visualization
        attendance_summary = self._create_attendance_summary_plot(attendance)
        
        return {
            'grade_summary': grade_summary,
            'attendance_summary': attendance_summary
        }

    def _create_grade_summary_plot(self, grades: pd.DataFrame) -> Dict[str, Any]:
        """Create a grade summary visualization."""
        if grades.empty:
            return None
        
        course_averages = grades.groupby('course_id')['score'].mean()
        
        fig = go.Figure(data=[
            go.Bar(x=course_averages.index, y=course_averages.values)
        ])
        
        fig.update_layout(
            title='Average Grades by Course',
            xaxis_title='Course',
            yaxis_title='Average Score'
        )
        
        return fig.to_dict()

    def _create_attendance_summary_plot(self, attendance: pd.DataFrame) -> Dict[str, Any]:
        """Create an attendance summary visualization."""
        if attendance.empty:
            return None
        
        attendance_by_course = attendance.groupby('course_id')['status'].value_counts(normalize=True).unstack()
        
        fig = go.Figure(data=[
            go.Bar(name=status, x=attendance_by_course.index, y=attendance_by_course[status])
            for status in attendance_by_course.columns
        ])
        
        fig.update_layout(
            title='Attendance Summary by Course',
            xaxis_title='Course',
            yaxis_title='Percentage',
            barmode='stack'
        )
        
        return fig.to_dict()

    def generate_recommendations_report(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a focused report on recommendations."""
        # Extract improvement areas
        improvement_areas = analysis_results.get('improvement_areas', [])
        
        # Generate specific recommendations
        recommendations = self._generate_specific_recommendations(improvement_areas)
        
        # Generate action plans
        action_plans = self._generate_action_plans(recommendations)
        
        return {
            'improvement_areas': improvement_areas,
            'recommendations': recommendations,
            'action_plans': action_plans
        }

    def _generate_specific_recommendations(self, improvement_areas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate specific recommendations for improvement areas."""
        recommendations = []
        
        for area in improvement_areas:
            if area['type'] == 'academic':
                recommendations.append({
                    'area': area['subject'],
                    'description': f"Focus on improving your performance in {area['subject']}",
                    'specific_actions': [
                        "Review course materials regularly",
                        "Practice with additional exercises",
                        "Seek help from professors or tutors"
                    ]
                })
            elif area['type'] == 'attendance':
                recommendations.append({
                    'area': 'Attendance',
                    'description': "Improve your attendance record",
                    'specific_actions': [
                        "Set up a daily schedule",
                        "Use attendance tracking apps",
                        "Communicate with professors about absences"
                    ]
                })
        
        return recommendations

    def _generate_action_plans(self, recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate detailed action plans for recommendations."""
        action_plans = []
        
        for recommendation in recommendations:
            action_plans.append({
                'area': recommendation['area'],
                'short_term_actions': recommendation['specific_actions'],
                'long_term_actions': [
                    "Develop a consistent study schedule",
                    "Build a support network of peers",
                    "Regularly review and adjust your strategies"
                ],
                'timeline': {
                    'immediate': recommendation['specific_actions'][:2],
                    'one_week': recommendation['specific_actions'][2:],
                    'one_month': recommendation['long_term_actions']
                }
            })
        
        return action_plans

    def _convert_to_pdf(self, html_content: str) -> str:
        """Convert HTML report to PDF."""
        # Configure PDF options
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': 'UTF-8',
            'no-outline': None,
            'enable-local-file-access': None
        }
        
        # Convert to PDF
        pdf = pdfkit.from_string(html_content, False, options=options)
        
        # Convert to base64 for storage/transmission
        return base64.b64encode(pdf).decode()

    def _generate_html_report(self, student_data: Dict[str, Any], analysis_results: Dict[str, Any], visualizations: Dict[str, str]) -> str:
        """Generate HTML report using Jinja2 template."""
        template = self.env.get_template('report_template.html')
        
        # Prepare data for template
        report_data = {
            'student_name': student_data['name'],
            'student_id': student_data['student_id'],
            'generation_date': datetime.now().strftime('%Y-%m-%d'),
            'overall_performance': analysis_results['overall_performance'],
            'subject_performance': analysis_results['subject_performance'],
            'attendance_analysis': analysis_results['attendance_analysis'],
            'study_habits_analysis': analysis_results['study_habits_analysis'],
            'improvement_areas': analysis_results['improvement_areas'],
            'predictions': analysis_results['predictions'],
            'visualizations': visualizations
        }
        
        return template.render(**report_data) 