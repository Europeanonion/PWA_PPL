#!/usr/bin/env python3

import pandas as pd
import json
import os
import re
from collections import defaultdict

def extract_workout_data(excel_file):
    """
    Extract workout data from the Excel file with a targeted approach based on the known structure.
    
    Args:
        excel_file (str): Path to the Excel file
        
    Returns:
        dict: Structured workout data
    """
    print(f"Extracting workout data from: {excel_file}")
    
    # Initialize the workout data structure
    workout_data = {
        "program_info": {
            "name": "The Ultimate Push Pull Legs System",
            "phases": 3,
            "weeks_per_phase": 6,
            "days_per_week": 6  # 6 days: Push1, Push2, Pull1, Pull2, Legs1, Legs2
        },
        "phases": {}
    }
    
    try:
        # Load all sheets
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        
        print(f"Found {len(sheet_names)} sheets: {', '.join(sheet_names)}")
        
        # Process each sheet (each sheet is a phase)
        for sheet_name in sheet_names:
            print(f"\nProcessing sheet: {sheet_name}")
            
            # Extract phase number from sheet name
            phase_match = re.search(r'phase\s*(\d+)', sheet_name, re.IGNORECASE)
            phase = int(phase_match.group(1)) if phase_match else None
            
            if not phase:
                print(f"  Could not determine phase number for sheet: {sheet_name}")
                continue
            
            phase_key = f"phase{phase}"
            workout_data["phases"][phase_key] = {
                "description": "",
                "weeks": {}
            }
            
            # Read the sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Get phase description from first row, first column
            if not df.empty and not pd.isna(df.columns[0]):
                workout_data["phases"][phase_key]["description"] = df.columns[0]
                print(f"  Phase description: {df.columns[0]}")
            
            # Initialize variables for tracking current week and day
            current_week = None
            current_day = None
            current_exercises = []
            
            # Process each row
            for i, row in df.iterrows():
                # Check if this row indicates a new week
                if not pd.isna(row.iloc[0]) and isinstance(row.iloc[0], str) and re.search(r'week\s*(\d+)', row.iloc[0], re.IGNORECASE):
                    week_match = re.search(r'week\s*(\d+)', row.iloc[0], re.IGNORECASE)
                    current_week = int(week_match.group(1))
                    week_key = f"week{current_week}"
                    
                    # Initialize week data if it doesn't exist
                    if week_key not in workout_data["phases"][phase_key]["weeks"]:
                        workout_data["phases"][phase_key]["weeks"][week_key] = {}
                    
                    print(f"  Found Week {current_week}")
                    continue
                
                # Check if this row indicates a new workout day
                day_patterns = {
                    "push1": re.compile(r'push\s*#?\s*1', re.IGNORECASE),
                    "push2": re.compile(r'push\s*#?\s*2', re.IGNORECASE),
                    "pull1": re.compile(r'pull\s*#?\s*1', re.IGNORECASE),
                    "pull2": re.compile(r'pull\s*#?\s*2', re.IGNORECASE),
                    "legs1": re.compile(r'legs?\s*#?\s*1', re.IGNORECASE),
                    "legs2": re.compile(r'legs?\s*#?\s*2', re.IGNORECASE)
                }
                
                if not pd.isna(row.iloc[0]):
                    for day_key, pattern in day_patterns.items():
                        if isinstance(row.iloc[0], str) and pattern.search(row.iloc[0]):
                            # If we were processing a previous day, save its exercises
                            if current_day and current_exercises and current_week:
                                week_key = f"week{current_week}"
                                workout_data["phases"][phase_key]["weeks"][week_key][current_day] = current_exercises
                            
                            # Start a new day
                            current_day = day_key
                            current_exercises = []
                            print(f"  Found workout day: {current_day}")
                            break
                
                # If we have a current week and day, and this row has an exercise name
                if current_week and current_day and not pd.isna(row.iloc[1]) and isinstance(row.iloc[1], str):
                    # This row contains exercise data
                    exercise_name = row.iloc[1].strip()
                    
                    # Skip if this is a header row
                    if exercise_name.lower() == "exercise":
                        continue
                    
                    # Extract exercise data
                    exercise = {
                        "name": exercise_name,
                        "warmup_sets": str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else "",
                        "working_sets": str(row.iloc[3]).strip() if not pd.isna(row.iloc[3]) else "",
                        "reps": str(row.iloc[4]).strip() if not pd.isna(row.iloc[4]) else "",
                        "load": str(row.iloc[5]).strip() if not pd.isna(row.iloc[5]) else "",
                        "rpe": str(row.iloc[6]).strip() if not pd.isna(row.iloc[6]) else "",
                        "rest": str(row.iloc[7]).strip() if not pd.isna(row.iloc[7]) else "",
                        "substitution1": str(row.iloc[8]).strip() if not pd.isna(row.iloc[8]) else "",
                        "substitution2": str(row.iloc[9]).strip() if not pd.isna(row.iloc[9]) else "",
                        "notes": str(row.iloc[10]).strip() if not pd.isna(row.iloc[10]) else ""
                    }
                    
                    # Clean up date values that might have been parsed incorrectly
                    for key in ["warmup_sets", "working_sets", "rpe"]:
                        if exercise[key] and re.search(r'\d{4}-\d{2}-\d{2}', exercise[key]):
                            # This is likely a date that was parsed incorrectly
                            if key == "warmup_sets":
                                exercise[key] = "2"  # Default value
                            elif key == "working_sets":
                                exercise[key] = "3"  # Default value
                            elif key == "rpe":
                                exercise[key] = "8-9"  # Default value
                    
                    current_exercises.append(exercise)
                    print(f"    Added exercise: {exercise_name}")
            
            # Save the last set of exercises
            if current_day and current_exercises and current_week:
                week_key = f"week{current_week}"
                workout_data["phases"][phase_key]["weeks"][week_key][current_day] = current_exercises
        
        # Save the workout data to a JSON file
        output_file = os.path.splitext(excel_file)[0] + "_workout_data.json"
        with open(output_file, 'w') as f:
            json.dump(workout_data, f, indent=2)
        
        print(f"\nWorkout data saved to {output_file}")
        
        # Print summary
        total_exercises = 0
        for phase_key, phase_data in workout_data["phases"].items():
            for week_key, week_data in phase_data["weeks"].items():
                for day_key, exercises in week_data.items():
                    total_exercises += len(exercises)
        
        print(f"Extracted {total_exercises} exercises across {len(workout_data['phases'])} phases")
        
        return workout_data
        
    except Exception as e:
        print(f"Error extracting workout data: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    excel_file = "The Ultimate Push Pull Legs System - 6x (2).xlsx"
    extract_workout_data(excel_file)

if __name__ == '__main__':
    main()