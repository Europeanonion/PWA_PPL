#!/usr/bin/env python3

import pandas as pd
import json
import os
import re
import argparse
from html import escape

def analyze_excel_workout(excel_file):
    """
    Analyzes the PPL workout Excel file and extracts structured data.
    
    Args:
        excel_file (str): Path to the Excel file
    
    Returns:
        dict: Analyzed workout data structure
    """
    print(f"Analyzing Excel file: {excel_file}")
    
    try:
        # Load the workbook - all sheets
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        
        # Initialize analysis structure
        analysis = {
            "program_structure": {
                "phases": [],
                "weeks_per_phase": 0,
                "days_per_week": 0,
                "progression_pattern": None
            },
            "workout_data": {},
            "exercise_library": {},
            "progression_patterns": {},
            "set_rep_schemes": {}
        }
        
        # Detect program structure from sheet names
        phase_pattern = re.compile(r'Phase (\d+)', re.IGNORECASE)
        week_pattern = re.compile(r'Week (\d+)', re.IGNORECASE)
        
        phases = set()
        weeks = set()
        
        for sheet in sheet_names:
            phase_match = phase_pattern.search(sheet)
            week_match = week_pattern.search(sheet)
            
            if phase_match:
                phases.add(int(phase_match.group(1)))
            if week_match:
                weeks.add(int(week_match.group(1)))
        
        # Update program structure
        analysis["program_structure"]["phases"] = sorted(list(phases)) if phases else [1, 2, 3]
        analysis["program_structure"]["weeks_per_phase"] = max(weeks) if weeks else 6
        
        # Process each sheet
        for sheet_name in sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Try to determine which phase and week this sheet belongs to
            phase_match = phase_pattern.search(sheet_name)
            week_match = week_pattern.search(sheet_name)
            
            phase = int(phase_match.group(1)) if phase_match else 1
            week = int(week_match.group(1)) if week_match else 1
            
            # Process the data in this sheet
            sheet_data = process_workout_sheet(df, phase, week)
            
            # Merge with main analysis
            if sheet_data:
                phase_key = f"phase{phase}"
                week_key = f"week{week}"
                
                if phase_key not in analysis["workout_data"]:
                    analysis["workout_data"][phase_key] = {}
                
                if week_key not in analysis["workout_data"][phase_key]:
                    analysis["workout_data"][phase_key][week_key] = {}
                
                # Merge workout days data
                for day_key, exercises in sheet_data.items():
                    analysis["workout_data"][phase_key][week_key][day_key] = exercises
                    
                    # Also populate exercise library
                    for ex in exercises:
                        if 'name' in ex and ex['name']:
                            ex_name = ex['name'].strip()
                            if ex_name not in analysis["exercise_library"]:
                                analysis["exercise_library"][ex_name] = {
                                    "muscle_groups": detect_muscle_groups(ex_name),
                                    "variations": [],
                                    "typical_sets": ex.get('sets', ''),
                                    "typical_reps": ex.get('reps', ''),
                                    "typical_rest": ex.get('rest', ''),
                                    "typical_rpe": ex.get('rpe', '')
                                }
                            
                            # Append to set/rep schemes collection
                            scheme_key = f"{ex.get('sets', '')}-{ex.get('reps', '')}-{ex.get('rpe', '')}"
                            if scheme_key not in analysis["set_rep_schemes"]:
                                analysis["set_rep_schemes"][scheme_key] = {
                                    "sets": ex.get('sets', ''),
                                    "reps": ex.get('reps', ''),
                                    "rpe": ex.get('rpe', ''),
                                    "exercises": []
                                }
                            
                            if ex_name not in analysis["set_rep_schemes"][scheme_key]["exercises"]:
                                analysis["set_rep_schemes"][scheme_key]["exercises"].append(ex_name)
        
        # Count workout days per week
        if analysis["workout_data"] and "phase1" in analysis["workout_data"] and "week1" in analysis["workout_data"]["phase1"]:
            analysis["program_structure"]["days_per_week"] = len(analysis["workout_data"]["phase1"]["week1"])
        
        # Analyze progression patterns
        analyze_progression_patterns(analysis)
        
        # Export analysis to JSON
        output_file = os.path.splitext(excel_file)[0] + "_analysis.json"
        with open(output_file, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"Analysis completed successfully. Results saved to {output_file}")
        
        return analysis
        
    except Exception as e:
        print(f"Error analyzing Excel file: {str(e)}")
        return None

def process_workout_sheet(df, phase, week):
    """
    Processes a single worksheet to extract workout data.
    
    Args:
        df (DataFrame): Pandas DataFrame with sheet data
        phase (int): Phase number
        week (int): Week number
        
    Returns:
        dict: Workout data organized by day
    """
    workout_data = {}
    
    # Common column headers to look for
    exercise_headers = ['exercise', 'exercises', 'movement', 'movements']
    sets_headers = ['sets', 'set', '# sets', 'set count']
    reps_headers = ['reps', 'rep', 'repetitions', 'rep range', 'rep count']
    rest_headers = ['rest', 'rest time', 'rest period', 'rest (min)']
    rpe_headers = ['rpe', 'intensity', 'effort', 'rir', 'reps in reserve']
    
    # Clean DataFrame
    df = df.dropna(how='all')
    
    # Try to determine workout days from data
    current_day = None
    exercises = []
    
    # Detect day headers
    day_patterns = [
        re.compile(r'push\s*day\s*[#]?\s*(\d+)', re.IGNORECASE),
        re.compile(r'pull\s*day\s*[#]?\s*(\d+)', re.IGNORECASE),
        re.compile(r'legs?\s*day\s*[#]?\s*(\d+)', re.IGNORECASE)
    ]
    
    # Helper to find column with specific headers
    def find_column(headers):
        for header in headers:
            for col in df.columns:
                if isinstance(col, str) and header.lower() in col.lower():
                    return col
        return None
    
    # Find key columns
    exercise_col = find_column(exercise_headers)
    sets_col = find_column(sets_headers)
    reps_col = find_column(reps_headers)
    rest_col = find_column(rest_headers)
    rpe_col = find_column(rpe_headers)
    
    # Fallback: try to detect header row if columns not found
    if not exercise_col:
        for i, row in df.iterrows():
            header_matches = 0
            for val in row:
                if isinstance(val, str):
                    val_lower = val.lower()
                    if any(header in val_lower for header in exercise_headers):
                        header_matches += 1
                    elif any(header in val_lower for header in sets_headers):
                        header_matches += 1
                    elif any(header in val_lower for header in reps_headers):
                        header_matches += 1
            
            if header_matches >= 2:
                # This is likely a header row, rename columns and start again
                df.columns = df.iloc[i]
                df = df.iloc[i+1:].reset_index(drop=True)
                return process_workout_sheet(df, phase, week)
    
    # Process each row
    for i, row in df.iterrows():
        # Check if this is a day header row
        day_found = False
        if isinstance(row.iloc[0], str):
            row_text = str(row.iloc[0]).strip()
            
            for pattern in day_patterns:
                match = pattern.search(row_text)
                if match:
                    day_type = pattern.pattern.split('\\')[0].replace('?', '').split('day')[0].strip()
                    day_num = match.group(1)
                    current_day = f"{day_type.lower()}{day_num}"
                    
                    # If we found a new day, store previous exercises
                    if exercises and current_day not in workout_data:
                        workout_data[current_day] = exercises
                        exercises = []
                    
                    day_found = True
                    break
        
        if day_found:
            continue
        
        # Process exercise row
        if exercise_col and not pd.isna(row[exercise_col]) and str(row[exercise_col]).strip():
            exercise_name = str(row[exercise_col]).strip()
            
            # Skip headers or non-exercise rows
            if exercise_name.lower() in [header.lower() for header in exercise_headers]:
                continue
                
            exercise = {
                'name': exercise_name,
                'sets': str(row[sets_col]).strip() if sets_col and not pd.isna(row[sets_col]) else '',
                'reps': str(row[reps_col]).strip() if reps_col and not pd.isna(row[reps_col]) else '',
                'rest': str(row[rest_col]).strip() if rest_col and not pd.isna(row[rest_col]) else '',
                'rpe': str(row[rpe_col]).strip() if rpe_col and not pd.isna(row[rpe_col]) else ''
            }
            
            # Add exercise to current day
            if current_day:
                exercises.append(exercise)
    
    # Add last group of exercises
    if current_day and exercises and current_day not in workout_data:
        workout_data[current_day] = exercises
    
    # If we couldn't detect days but have exercises, create default days
    if not workout_data and exercises:
        workout_data["push1"] = exercises
    
    return workout_data

def analyze_progression_patterns(analysis):
    """
    Analyzes exercise progression patterns across phases and weeks.
    
    Args:
        analysis (dict): Workout analysis data
    """
    progression_patterns = {}
    
    workout_data = analysis["workout_data"]
    
    # For each exercise, track its appearance and parameters across phases/weeks
    exercise_progression = {}
    
    for phase_key, phase_data in workout_data.items():
        for week_key, week_data in phase_data.items():
            for day_key, exercises in week_data.items():
                for ex in exercises:
                    if 'name' in ex and ex['name']:
                        ex_name = ex['name'].strip()
                        
                        if ex_name not in exercise_progression:
                            exercise_progression[ex_name] = []
                        
                        # Record this instance
                        exercise_progression[ex_name].append({
                            'phase': phase_key,
                            'week': week_key,
                            'day': day_key,
                            'sets': ex.get('sets', ''),
                            'reps': ex.get('reps', ''),
                            'rest': ex.get('rest', ''),
                            'rpe': ex.get('rpe', '')
                        })
    
    # Analyze progression for each exercise
    for ex_name, instances in exercise_progression.items():
        if len(instances) > 1:
            # Sort by phase and week
            instances.sort(key=lambda x: (x['phase'], x['week']))
            
            # Look for progression patterns
            sets_pattern = []
            reps_pattern = []
            rpe_pattern = []
            
            for instance in instances:
                # Add to patterns if numeric values
                try:
                    if instance['sets'] and instance['sets'] != '':
                        sets_val = instance['sets']
                        sets_pattern.append(sets_val)
                except:
                    pass
                
                try:
                    if instance['reps'] and instance['reps'] != '':
                        reps_val = instance['reps']
                        reps_pattern.append(reps_val)
                except:
                    pass
                
                try:
                    if instance['rpe'] and instance['rpe'] != '':
                        rpe_val = instance['rpe']
                        rpe_pattern.append(rpe_val)
                except:
                    pass
            
            # Analyze patterns
            progression = {
                'frequency': len(instances),
                'phases_present': list(set(i['phase'] for i in instances)),
                'days_present': list(set(i['day'] for i in instances)),
                'sets_progression': sets_pattern,
                'reps_progression': reps_pattern,
                'rpe_progression': rpe_pattern,
                'progression_type': detect_progression_type(sets_pattern, reps_pattern, rpe_pattern)
            }
            
            progression_patterns[ex_name] = progression
    
    analysis["progression_patterns"] = progression_patterns
    return analysis

def detect_progression_type(sets_pattern, reps_pattern, rpe_pattern):
    """
    Attempts to detect the type of progression for an exercise.
    
    Args:
        sets_pattern (list): Pattern of sets across instances
        reps_pattern (list): Pattern of reps across instances
        rpe_pattern (list): Pattern of RPE across instances
        
    Returns:
        str: Detected progression type
    """
    # Linear progression (increasing sets, reps, or RPE)
    if is_increasing(sets_pattern):
        return "Linear Sets Progression"
    elif is_increasing(extract_min_reps(reps_pattern)):
        return "Linear Reps Progression"
    elif is_increasing(extract_min_rpe(rpe_pattern)):
        return "Linear Intensity Progression"
        
    # Double progression (first reps increase, then weight would increase)
    elif is_rep_range_consistent(reps_pattern) and len(reps_pattern) > 1:
        return "Double Progression"
        
    # Wave loading (values fluctuate in a wave pattern)
    elif is_wave_pattern(sets_pattern) or is_wave_pattern(extract_min_reps(reps_pattern)) or is_wave_pattern(extract_min_rpe(rpe_pattern)):
        return "Wave Loading"
    
    # Undulating periodization (values vary but without clear pattern)
    elif has_variations(sets_pattern) or has_variations(reps_pattern) or has_variations(rpe_pattern):
        return "Undulating Periodization"
    
    # Otherwise, consistent parameters
    else:
        return "Consistent Parameters"

def is_increasing(values):
    """Check if values are generally increasing"""
    if not values or len(values) < 2:
        return False
        
    # Try to convert to numeric if possible
    numeric_values = []
    for v in values:
        try:
            numeric_values.append(float(v))
        except:
            return False
    
    # Check if generally increasing (allow some variation)
    increases = sum(1 for i in range(len(numeric_values)-1) if numeric_values[i] < numeric_values[i+1])
    return increases > len(numeric_values) * 0.6  # More than 60% increases

def is_wave_pattern(values):
    """Check for a wave pattern (up then down then up)"""
    if not values or len(values) < 3:
        return False
        
    # Try to convert to numeric
    try:
        numeric_values = [float(v) for v in values]
        
        # Check for direction changes
        directions = []
        for i in range(len(numeric_values)-1):
            if numeric_values[i] < numeric_values[i+1]:
                directions.append(1)  # Increasing
            elif numeric_values[i] > numeric_values[i+1]:
                directions.append(-1)  # Decreasing
            else:
                directions.append(0)  # No change
        
        # Count direction changes
        changes = sum(1 for i in range(len(directions)-1) if directions[i] != directions[i+1] and directions[i] != 0 and directions[i+1] != 0)
        return changes >= 1  # At least one change in direction
    except:
        return False

def has_variations(values):
    """Check if values vary without a clear pattern"""
    if not values or len(values) < 2:
        return False
        
    # Try to convert to numeric
    try:
        numeric_values = [float(v) for v in values]
        unique_values = set(numeric_values)
        return len(unique_values) > 1
    except:
        # If we can't convert to numeric, check for any differences
        return len(set(values)) > 1

def extract_min_reps(rep_ranges):
    """Extract minimum reps from rep ranges like '8-10', '8-12', etc."""
    result = []
    for rng in rep_ranges:
        if isinstance(rng, str):
            # Try patterns like "8-10", "8 to 10", "8~10"
            match = re.search(r'(\d+)[-~to]+(\d+)', rng)
            if match:
                result.append(int(match.group(1)))
            else:
                # Try to just get a number
                match = re.search(r'(\d+)', rng)
                if match:
                    result.append(int(match.group(1)))
        elif isinstance(rng, (int, float)):
            result.append(rng)
    return result

def extract_min_rpe(rpe_values):
    """Extract minimum RPE from ranges like '7-9', '8-9', etc."""
    result = []
    for val in rpe_values:
        if isinstance(val, str):
            # Try patterns like "8-9", "8 to 9"
            match = re.search(r'(\d+)[-~to]+(\d+)', val)
            if match:
                result.append(int(match.group(1)))
            else:
                # Try to just get a number
                match = re.search(r'(\d+)', val)
                if match:
                    result.append(int(match.group(1)))
        elif isinstance(val, (int, float)):
            result.append(val)
    return result

def is_rep_range_consistent(rep_ranges):
    """Check if rep ranges are consistent (e.g., always '8-10')"""
    if not rep_ranges or len(rep_ranges) < 2:
        return False
        
    # Convert to string for comparison
    str_ranges = [str(r) for r in rep_ranges]
    return len(set(str_ranges)) < len(str_ranges) * 0.5  # Less than 50% unique values

def detect_muscle_groups(exercise_name):
    """
    Detect likely muscle groups based on exercise name.
    
    Args:
        exercise_name (str): Name of the exercise
        
    Returns:
        list: Likely muscle groups targeted
    """
    exercise_name = exercise_name.lower()
    
    muscle_groups = []
    
    # Chest exercises
    if any(term in exercise_name for term in ['bench press', 'chest press', 'fly', 'flye', 'pushup', 'push-up', 'push up', 'dip', 'decline', 'incline', 'svend']):
        muscle_groups.append('chest')
    
    # Back exercises
    if any(term in exercise_name for term in ['row', 'pulldown', 'pull-down', 'pull down', 'pullup', 'pull-up', 'pull up', 'deadlift', 'lat', 'back', 'hyper']):
        muscle_groups.append('back')
    
    # Shoulder exercises
    if any(term in exercise_name for term in ['shoulder', 'overhead', 'press', 'lateral', 'front raise', 'rear delt', 'face pull', 'shrug']):
        muscle_groups.append('shoulders')
    
    # Leg exercises
    if any(term in exercise_name for term in ['squat', 'leg', 'lunge', 'deadlift', 'calf', 'glute', 'ham', 'quad']):
        muscle_groups.append('legs')
    
    # Arm exercises
    if any(term in exercise_name for term in ['curl', 'tricep', 'extension', 'skull', 'kickback']):
        if 'tricep' in exercise_name or 'extension' in exercise_name or 'skull' in exercise_name or 'pushdown' in exercise_name:
            muscle_groups.append('triceps')
        else:
            muscle_groups.append('biceps')
    
    # Core exercises
    if any(term in exercise_name for term in ['ab', 'core', 'crunch', 'situp', 'sit-up', 'sit up', 'plank', 'twist']):
        muscle_groups.append('core')
    
    # If no groups detected, make a guess based on PPL structure
    if not muscle_groups:
        if 'press' in exercise_name or 'fly' in exercise_name or 'extension' in exercise_name:
            muscle_groups.append('push')
        elif 'row' in exercise_name or 'pull' in exercise_name or 'curl' in exercise_name:
            muscle_groups.append('pull')
        else:
            muscle_groups.append('unknown')
    
    return muscle_groups

def generate_exercise_id(name):
    """
    Generate a safe ID from exercise name for HTML/JS.
    
    Args:
        name (str): Exercise name
        
    Returns:
        str: Safe ID
    """
    # Remove non-alphanumeric characters and convert spaces to hyphens
    safe_id = re.sub(r'[^a-zA-Z0-9]', '', name.lower().replace(' ', '-'))
    return safe_id

def get_phase_description(phase):
    """
    Get description for a workout phase.
    
    Args:
        phase (int): Phase number
        
    Returns:
        str: Phase description
    """
    descriptions = {
        1: "building a foundation with moderate volume and intensity",
        2: "progressive overload with increasing weights and controlled volume",
        3: "peak intensity and specialized techniques for maximum results"
    }
    return descriptions.get(phase, "progressive overload and consistent training")

def main():
    parser = argparse.ArgumentParser(description='Analyze PPL workout Excel file and generate HTML')
    parser.add_argument('excel_file', help='Path to the Excel file')
    args = parser.parse_args()
    
    if not os.path.isfile(args.excel_file):
        print(f"Error: File {args.excel_file} not found")
        return
    
    # Analyze the Excel file
    analysis = analyze_excel_workout(args.excel_file)
    
    if analysis:
        # Generate HTML from analysis
        analysis_file = os.path.splitext(args.excel_file)[0] + "_analysis.json"
        from generate_ppl_html import generate_html_from_analysis
        generate_html_from_analysis(analysis_file)

if __name__ == '__main__':
    main()