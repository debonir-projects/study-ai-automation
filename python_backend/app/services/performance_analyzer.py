import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import torch
import torch.nn as nn
from typing import List, Dict, Any, Tuple
import json
from sklearn.linear_model import LinearRegression

class PerformanceAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = self._create_model()
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)

    def _create_model(self) -> nn.Module:
        """Create a PyTorch neural network for performance prediction."""
        class PerformancePredictor(nn.Module):
            def __init__(self):
                super().__init__()
                self.layers = nn.Sequential(
                    nn.Linear(10, 64),
                    nn.ReLU(),
                    nn.Dropout(0.2),
                    nn.Linear(64, 32),
                    nn.ReLU(),
                    nn.Dropout(0.2),
                    nn.Linear(32, 1)
                )

            def forward(self, x):
                return self.layers(x)

        return PerformancePredictor()

    def prepare_data(self, student_data: Dict[str, Any]) -> pd.DataFrame:
        """Prepare student data for analysis."""
        # Convert data to DataFrame
        df = pd.DataFrame(student_data)
        
        # Calculate basic metrics
        df['attendance_rate'] = df['attendance'].apply(
            lambda x: sum(1 for a in x if a['status'] == 'present') / len(x)
        )
        
        df['average_grade'] = df['grades'].apply(
            lambda x: np.mean([g['score'] for g in x])
        )
        
        df['study_hours'] = df['study_habits'].apply(
            lambda x: sum(h['duration'] for h in x) / 60  # Convert minutes to hours
        )
        
        return df

    def analyze_performance(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze student performance data comprehensively."""
        # Convert data to DataFrames
        grades = pd.DataFrame(student_data.get('grades', []))
        attendance = pd.DataFrame(student_data.get('attendance', []))
        study_habits = pd.DataFrame(student_data.get('study_habits', []))
        
        # Perform various analyses
        grade_analysis = self._analyze_grades(grades)
        attendance_analysis = self._analyze_attendance(attendance)
        study_habits_analysis = self._analyze_study_habits(study_habits)
        
        # Generate predictions
        predictions = self._generate_predictions(grades, attendance, study_habits)
        
        # Identify improvement areas
        improvement_areas = self._identify_improvement_areas(
            grade_analysis,
            attendance_analysis,
            study_habits_analysis
        )
        
        # Generate summary
        summary = self._generate_summary(
            grade_analysis,
            attendance_analysis,
            study_habits_analysis,
            predictions,
            improvement_areas
        )
        
        return {
            'grade_analysis': grade_analysis,
            'attendance_analysis': attendance_analysis,
            'study_habits_analysis': study_habits_analysis,
            'predictions': predictions,
            'improvement_areas': improvement_areas,
            'summary': summary
        }

    def _analyze_grades(self, grades: pd.DataFrame) -> Dict[str, Any]:
        """Analyze grade patterns and trends."""
        if grades.empty:
            return {}
        
        # Convert date strings to datetime
        grades['date'] = pd.to_datetime(grades['date'])
        
        # Calculate basic statistics
        stats = {
            'average_score': grades['score'].mean(),
            'highest_score': grades['score'].max(),
            'lowest_score': grades['score'].min(),
            'score_std': grades['score'].std(),
            'total_assignments': len(grades),
            'completed_assignments': len(grades[grades['score'].notna()])
        }
        
        # Analyze trends by course
        trends = {}
        for course_id in grades['course_id'].unique():
            course_grades = grades[grades['course_id'] == course_id]
            if len(course_grades) > 1:
                trend = self._calculate_trend(course_grades['score'])
                trends[course_id] = {
                    'trend': trend,
                    'average': course_grades['score'].mean(),
                    'variance': course_grades['score'].var()
                }
        
        # Identify grade patterns
        patterns = self._identify_grade_patterns(grades)
        
        return {
            'stats': stats,
            'trends': trends,
            'patterns': patterns
        }

    def _analyze_attendance(self, attendance: pd.DataFrame) -> Dict[str, Any]:
        """Analyze attendance patterns."""
        if attendance.empty:
            return {}
        
        # Convert date strings to datetime
        attendance['date'] = pd.to_datetime(attendance['date'])
        
        # Calculate basic statistics
        stats = {
            'total_sessions': len(attendance),
            'attended_sessions': len(attendance[attendance['status'] == 'present']),
            'attendance_rate': len(attendance[attendance['status'] == 'present']) / len(attendance) if len(attendance) > 0 else 0
        }
        
        # Analyze patterns by course
        patterns = {}
        for course_id in attendance['course_id'].unique():
            course_attendance = attendance[attendance['course_id'] == course_id]
            patterns[course_id] = {
                'attendance_rate': len(course_attendance[course_attendance['status'] == 'present']) / len(course_attendance),
                'total_sessions': len(course_attendance),
                'missed_sessions': len(course_attendance[course_attendance['status'] == 'absent'])
            }
        
        # Identify attendance trends
        trends = self._identify_attendance_trends(attendance)
        
        return {
            'stats': stats,
            'patterns': patterns,
            'trends': trends
        }

    def _analyze_study_habits(self, study_habits: pd.DataFrame) -> Dict[str, Any]:
        """Analyze study habits and patterns."""
        if study_habits.empty:
            return {}
        
        # Convert date strings to datetime
        study_habits['date'] = pd.to_datetime(study_habits['date'])
        
        # Calculate basic statistics
        stats = {
            'total_study_hours': study_habits['duration'].sum(),
            'average_daily_hours': study_habits.groupby(study_habits['date'].dt.date)['duration'].sum().mean(),
            'total_sessions': len(study_habits),
            'unique_subjects': study_habits['subject'].nunique()
        }
        
        # Analyze patterns by subject
        patterns = {}
        for subject in study_habits['subject'].unique():
            subject_habits = study_habits[study_habits['subject'] == subject]
            patterns[subject] = {
                'total_hours': subject_habits['duration'].sum(),
                'average_session_duration': subject_habits['duration'].mean(),
                'frequency': len(subject_habits)
            }
        
        # Identify study habit trends
        trends = self._identify_study_habits_trends(study_habits)
        
        return {
            'stats': stats,
            'patterns': patterns,
            'trends': trends
        }

    def _generate_predictions(self, grades: pd.DataFrame, attendance: pd.DataFrame, study_habits: pd.DataFrame) -> Dict[str, Any]:
        """Generate performance predictions."""
        predictions = {}
        
        # Prepare features for prediction
        features = self._prepare_prediction_features(grades, attendance, study_habits)
        
        if not features.empty:
            # Predict final grades
            grade_predictions = self._predict_final_grades(features)
            predictions['final_grades'] = grade_predictions
            
            # Predict attendance
            attendance_predictions = self._predict_attendance(features)
            predictions['attendance'] = attendance_predictions
            
            # Predict study habits
            study_habits_predictions = self._predict_study_habits(features)
            predictions['study_habits'] = study_habits_predictions
        
        return predictions

    def _identify_improvement_areas(self, grade_analysis: Dict[str, Any], attendance_analysis: Dict[str, Any], study_habits_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify areas for improvement."""
        improvement_areas = []
        
        # Analyze grade improvement areas
        for course_id, trend in grade_analysis.get('trends', {}).items():
            if trend['trend'] == 'declining' or trend['average'] < 70:
                improvement_areas.append({
                    'type': 'academic',
                    'subject': course_id,
                    'severity': 'high' if trend['trend'] == 'declining' else 'medium',
                    'description': f"Performance in {course_id} needs improvement"
                })
        
        # Analyze attendance improvement areas
        for course_id, pattern in attendance_analysis.get('patterns', {}).items():
            if pattern['attendance_rate'] < 0.8:
                improvement_areas.append({
                    'type': 'attendance',
                    'subject': course_id,
                    'severity': 'medium',
                    'description': f"Attendance in {course_id} needs improvement"
                })
        
        # Analyze study habits improvement areas
        for subject, pattern in study_habits_analysis.get('patterns', {}).items():
            if pattern['total_hours'] < 10:  # Less than 10 hours per subject
                improvement_areas.append({
                    'type': 'study_habits',
                    'subject': subject,
                    'severity': 'low',
                    'description': f"Study time for {subject} needs improvement"
                })
        
        return improvement_areas

    def _generate_summary(self, grade_analysis: Dict[str, Any], attendance_analysis: Dict[str, Any], study_habits_analysis: Dict[str, Any], predictions: Dict[str, Any], improvement_areas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a comprehensive summary of the analysis."""
        return {
            'overall_performance': {
                'grade_average': grade_analysis.get('stats', {}).get('average_score', 0),
                'attendance_rate': attendance_analysis.get('stats', {}).get('attendance_rate', 0),
                'study_hours': study_habits_analysis.get('stats', {}).get('total_study_hours', 0)
            },
            'key_findings': {
                'grade_trends': [f"{course}: {trend['trend']}" for course, trend in grade_analysis.get('trends', {}).items()],
                'attendance_patterns': [f"{course}: {pattern['attendance_rate']:.2%}" for course, pattern in attendance_analysis.get('patterns', {}).items()],
                'study_patterns': [f"{subject}: {pattern['total_hours']:.1f} hours" for subject, pattern in study_habits_analysis.get('patterns', {}).items()]
            },
            'improvement_areas': len(improvement_areas),
            'predictions': {
                'final_grades': predictions.get('final_grades', {}),
                'attendance': predictions.get('attendance', {}),
                'study_habits': predictions.get('study_habits', {})
            }
        }

    def _calculate_trend(self, values: pd.Series) -> str:
        """Calculate the trend of a series of values."""
        if len(values) < 2:
            return 'stable'
        
        x = np.arange(len(values)).reshape(-1, 1)
        y = values.values.reshape(-1, 1)
        
        model = LinearRegression()
        model.fit(x, y)
        
        slope = model.coef_[0][0]
        
        if slope > 0.1:
            return 'improving'
        elif slope < -0.1:
            return 'declining'
        else:
            return 'stable'

    def _identify_grade_patterns(self, grades: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify patterns in grade data."""
        patterns = []
        
        # Analyze grade distribution
        grade_distribution = grades['score'].value_counts().sort_index()
        
        # Identify grade clusters
        clusters = self._identify_grade_clusters(grade_distribution)
        
        # Analyze grade progression
        progression = self._analyze_grade_progression(grades)
        
        patterns.extend(clusters)
        patterns.extend(progression)
        
        return patterns

    def _identify_attendance_trends(self, attendance: pd.DataFrame) -> Dict[str, Any]:
        """Identify trends in attendance data."""
        trends = {}
        
        # Calculate daily attendance rates
        daily_attendance = attendance.groupby(attendance['date'].dt.date)['status'].apply(
            lambda x: (x == 'present').mean()
        )
        
        # Calculate weekly trends
        weekly_trends = daily_attendance.resample('W').mean()
        
        # Identify patterns
        patterns = self._identify_attendance_patterns(attendance)
        
        trends['daily_rates'] = daily_attendance.to_dict()
        trends['weekly_trends'] = weekly_trends.to_dict()
        trends['patterns'] = patterns
        
        return trends

    def _identify_study_habits_trends(self, study_habits: pd.DataFrame) -> Dict[str, Any]:
        """Identify trends in study habits data."""
        trends = {}
        
        # Calculate daily study hours
        daily_study = study_habits.groupby(study_habits['date'].dt.date)['duration'].sum()
        
        # Calculate weekly trends
        weekly_trends = daily_study.resample('W').mean()
        
        # Identify patterns
        patterns = self._identify_study_patterns(study_habits)
        
        trends['daily_hours'] = daily_study.to_dict()
        trends['weekly_trends'] = weekly_trends.to_dict()
        trends['patterns'] = patterns
        
        return trends

    def _prepare_prediction_features(self, grades: pd.DataFrame, attendance: pd.DataFrame, study_habits: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for prediction."""
        features = pd.DataFrame()
        
        # Calculate grade features
        if not grades.empty:
            grade_features = grades.groupby('course_id').agg({
                'score': ['mean', 'std', 'count']
            })
            grade_features.columns = ['grade_mean', 'grade_std', 'grade_count']
            features = pd.concat([features, grade_features], axis=1)
        
        # Calculate attendance features
        if not attendance.empty:
            attendance_features = attendance.groupby('course_id').agg({
                'status': lambda x: (x == 'present').mean()
            })
            attendance_features.columns = ['attendance_rate']
            features = pd.concat([features, attendance_features], axis=1)
        
        # Calculate study habits features
        if not study_habits.empty:
            study_features = study_habits.groupby('subject').agg({
                'duration': ['sum', 'mean', 'count']
            })
            study_features.columns = ['total_hours', 'avg_session_duration', 'session_count']
            features = pd.concat([features, study_features], axis=1)
        
        return features

    def _predict_final_grades(self, features: pd.DataFrame) -> Dict[str, float]:
        """Predict final grades for each course."""
        predictions = {}
        
        if 'grade_mean' in features.columns:
            # Simple prediction based on current performance
            for course_id, row in features.iterrows():
                predictions[course_id] = row['grade_mean']
        
        return predictions

    def _predict_attendance(self, features: pd.DataFrame) -> Dict[str, float]:
        """Predict future attendance rates."""
        predictions = {}
        
        if 'attendance_rate' in features.columns:
            for course_id, row in features.iterrows():
                predictions[course_id] = row['attendance_rate']
        
        return predictions

    def _predict_study_habits(self, features: pd.DataFrame) -> Dict[str, float]:
        """Predict future study habits."""
        predictions = {}
        
        if 'total_hours' in features.columns:
            for subject, row in features.iterrows():
                predictions[subject] = row['total_hours']
        
        return predictions

    def _identify_grade_clusters(self, grade_distribution: pd.Series) -> List[Dict[str, Any]]:
        """Identify clusters in grade distribution."""
        clusters = []
        
        # Simple clustering based on grade ranges
        ranges = [(0, 60), (60, 70), (70, 80), (80, 90), (90, 100)]
        
        for start, end in ranges:
            count = grade_distribution[(grade_distribution.index >= start) & (grade_distribution.index < end)].sum()
            if count > 0:
                clusters.append({
                    'type': 'grade_range',
                    'range': f"{start}-{end}",
                    'count': int(count),
                    'percentage': count / grade_distribution.sum()
                })
        
        return clusters

    def _analyze_grade_progression(self, grades: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze grade progression over time."""
        progression = []
        
        for course_id in grades['course_id'].unique():
            course_grades = grades[grades['course_id'] == course_id].sort_values('date')
            if len(course_grades) > 1:
                trend = self._calculate_trend(course_grades['score'])
                progression.append({
                    'type': 'progression',
                    'course_id': course_id,
                    'trend': trend,
                    'start_score': course_grades['score'].iloc[0],
                    'end_score': course_grades['score'].iloc[-1]
                })
        
        return progression

    def _identify_attendance_patterns(self, attendance: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify patterns in attendance data."""
        patterns = []
        
        # Analyze day-of-week patterns
        attendance['day_of_week'] = attendance['date'].dt.dayofweek
        day_patterns = attendance.groupby('day_of_week')['status'].apply(
            lambda x: (x == 'present').mean()
        )
        
        for day, rate in day_patterns.items():
            if rate < 0.8:
                patterns.append({
                    'type': 'day_pattern',
                    'day': day,
                    'attendance_rate': rate
                })
        
        return patterns

    def _identify_study_patterns(self, study_habits: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify patterns in study habits data."""
        patterns = []
        
        # Analyze time-of-day patterns
        study_habits['hour'] = study_habits['date'].dt.hour
        time_patterns = study_habits.groupby('hour')['duration'].mean()
        
        for hour, duration in time_patterns.items():
            if duration > 0:
                patterns.append({
                    'type': 'time_pattern',
                    'hour': hour,
                    'average_duration': duration
                })
        
        return patterns 