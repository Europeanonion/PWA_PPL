# Excel Extraction Plan

## Overview

To get a clear understanding of the content in "The Ultimate Push Pull Legs System - 6x (2).xlsx", we need to create a more robust extraction script. This document outlines the approach for creating this script.

## Extraction Script Requirements

The script should:

1. Read all sheets from the Excel file
2. Extract workout data including exercises, sets, reps, rest periods, etc.
3. Output the data in a structured JSON format
4. Print a summary of what was found to help understand the Excel structure

## Proposed Script Structure

```python
#!/usr/bin/env python3

import pandas as pd
import json
import os
import re
from collections import defaultdict

def extract_excel_overview(excel_file):
    """
    Extract an overview of the Excel file content to understand its structure.
    
    Args:
        excel_file (str): Path to the Excel file
        
    Returns:
        dict: Overview of the Excel content
    """
    print(f"Analyzing Excel file: {excel_file}")
    
    # Initialize the overview structure
    overview = {
        "sheet_summary": {},
        "detected_workout_days": [],
        "exercise_list": set(),
        "sample_data": {}
    }
    
    try:
        # Load all sheets
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        
        print(f"Found {len(sheet_names)} sheets: {', '.join(sheet_names)}")
        
        # Process each sheet
        for sheet_name in sheet_names:
            print(f"\nAnalyzing sheet: {sheet_name}")
            
            # Try to determine phase and week from sheet name
            phase_match = re.search(r'phase\s*(\d+)', sheet_name, re.IGNORECASE)
            week_match = re.search(r'week\s*(\d+)', sheet_name, re.IGNORECASE)
            
            phase = int(phase_match.group(1)) if phase_match else None
            week = int(week_match.group(1)) if week_match else None
            
            # Read the sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Skip empty sheets
            if df.empty:
                overview["sheet_summary"][sheet_name] = {
                    "rows": 0,
                    "columns": 0,
                    "phase": phase,
                    "week": week,
                    "is_empty": True
                }
                continue
            
            # Basic sheet info
            overview["sheet_summary"][sheet_name] = {
                "rows": len(df),
                "columns": len(df.columns),
                "phase": phase,
                "week": week,
                "is_empty": False,
                "column_headers": list(df.columns)
            }
            
            # Look for workout day headers
            day_patterns = [
                re.compile(r'push\s*day\s*[#]?\s*(\d+)', re.IGNORECASE),
                re.compile(r'pull\s*day\s*[#]?\s*(\d+)', re.IGNORECASE),
                re.compile(r'legs?\s*day\s*[#]?\s*(\d+)', re.IGNORECASE)
            ]
            
            # Detect workout days and exercises
            workout_days = []
            current_day = None
            exercises = []
            
            for i, row in df.iterrows():
                row_text = ' '.join([str(x) for x in row if isinstance(x, str)])
                
                # Check for day headers
                for pattern in day_patterns:
                    match = pattern.search(row_text)
                    if match:
                        day_type = pattern.pattern.split('\\')[0].replace('?', '').split('day')[0].strip()
                        day_num = match.group(1)
                        current_day = f"{day_type.lower()}{day_num}"
                        
                        if current_day not in workout_days:
                            workout_days.append(current_day)
                            print(f"  Found workout day: {current_day}")
                        
                        # If we found a new day, store previous exercises
                        if exercises:
                            # Store sample data for the previous day
                            if len(overview["sample_data"]) < 3:  # Limit to 3 samples
                                day_key = f"{sheet_name}_{workout_days[-2]}" if len(workout_days) > 1 else f"{sheet_name}_{workout_days[0]}"
                                overview["sample_data"][day_key] = exercises[:5]  # Store up to 5 exercises
                            
                            exercises = []
                
                # Try to detect exercises
                if current_day and len(row) > 2:
                    # Simple heuristic: if first column has text and second column looks like a number
                    # it might be an exercise with sets
                    first_col = str(row.iloc[0]).strip() if not pd.isna(row.iloc[0]) else ""
                    second_col = str(row.iloc[1]).strip() if len(row) > 1 and not pd.isna(row.iloc[1]) else ""
                    
                    if first_col and (second_col.isdigit() or second_col in ['1', '2', '3', '4', '5']):
                        exercise = {
                            "name": first_col,
                            "sets": second_col,
                            "reps": str(row.iloc[2]).strip() if len(row) > 2 and not pd.isna(row.iloc[2]) else "",
                            "rest": str(row.iloc[3]).strip() if len(row) > 3 and not pd.isna(row.iloc[3]) else "",
                            "rpe": str(row.iloc[4]).strip() if len(row) > 4 and not pd.isna(row.iloc[4]) else ""
                        }
                        
                        exercises.append(exercise)
                        overview["exercise_list"].add(first_col)
            
            # Add workout days to the overview
            if workout_days:
                overview["detected_workout_days"].extend(workout_days)
        
        # Convert exercise_list to a sorted list
        overview["exercise_list"] = sorted(list(overview["exercise_list"]))
        
        # Save the overview to a JSON file
        output_file = os.path.splitext(excel_file)[0] + "_overview.json"
        with open(output_file, 'w') as f:
            json.dump(overview, f, indent=2)
        
        print(f"\nOverview saved to {output_file}")
        print(f"Found {len(overview['exercise_list'])} unique exercises")
        print(f"Detected workout days: {', '.join(sorted(set(overview['detected_workout_days'])))}")
        
        return overview
        
    except Exception as e:
        print(f"Error analyzing Excel file: {str(e)}")
        return None

def main():
    excel_file = "The Ultimate Push Pull Legs System - 6x (2).xlsx"
    extract_excel_overview(excel_file)

if __name__ == '__main__':
    main()
```

## Expected Output

The script will generate a JSON file with:

1. **Sheet Summary**: Information about each sheet in the Excel file, including:
   - Number of rows and columns
   - Detected phase and week (if present in sheet name)
   - Column headers
   - Whether the sheet is empty

2. **Detected Workout Days**: List of all workout days found (e.g., "push1", "pull1", "legs1")

3. **Exercise List**: List of all unique exercises found across all sheets

4. **Sample Data**: Sample exercise data from a few workout days to understand the structure

## Next Steps

1. Implement this script in Code mode
2. Run the script to analyze the Excel file
3. Review the output to understand the Excel structure
4. Based on the findings, decide whether to:
   - Fix the existing Excel extraction script
   - Create a new, more targeted extraction script
   - Proceed with manual implementation

## Implementation Plan

Once we have a clear understanding of the Excel content, we can proceed with the implementation plan outlined earlier, with any necessary adjustments based on our findings.