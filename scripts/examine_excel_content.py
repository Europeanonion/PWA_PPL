#!/usr/bin/env python3

import pandas as pd
import json
import os
import re

def examine_excel_content(excel_file):
    """
    Examine the actual content of the Excel file to understand its structure.
    
    Args:
        excel_file (str): Path to the Excel file
    """
    print(f"Examining Excel file: {excel_file}")
    
    try:
        # Load all sheets
        xl = pd.ExcelFile(excel_file)
        sheet_names = xl.sheet_names
        
        print(f"Found {len(sheet_names)} sheets: {', '.join(sheet_names)}")
        
        # Process each sheet
        for sheet_name in sheet_names:
            print(f"\n{'='*50}")
            print(f"SHEET: {sheet_name}")
            print(f"{'='*50}")
            
            # Read the sheet
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Print basic info
            print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
            
            # Print the first few rows to see the structure
            print("\nFirst 10 rows:")
            pd.set_option('display.max_columns', None)  # Show all columns
            pd.set_option('display.width', 1000)  # Wide display
            print(df.head(10).to_string())
            
            # Look for specific patterns in the data
            print("\nSearching for workout day patterns...")
            
            # Patterns to look for
            day_patterns = [
                re.compile(r'push\s*day', re.IGNORECASE),
                re.compile(r'pull\s*day', re.IGNORECASE),
                re.compile(r'legs?\s*day', re.IGNORECASE),
                re.compile(r'week\s*\d+', re.IGNORECASE)
            ]
            
            # Search all cells for these patterns
            for pattern in day_patterns:
                pattern_name = pattern.pattern
                matches = []
                
                # Search each cell in the DataFrame
                for i, row in df.iterrows():
                    for col, value in row.items():
                        if isinstance(value, str) and pattern.search(value):
                            matches.append((i, col, value))
                
                if matches:
                    print(f"\nFound {len(matches)} matches for pattern '{pattern_name}':")
                    for i, (row_idx, col, value) in enumerate(matches[:5]):  # Show first 5 matches
                        print(f"  Match {i+1}: Row {row_idx}, Column '{col}', Value: '{value}'")
                    if len(matches) > 5:
                        print(f"  ... and {len(matches) - 5} more matches")
            
            # Look for exercise-related terms
            exercise_patterns = [
                re.compile(r'bench\s*press', re.IGNORECASE),
                re.compile(r'squat', re.IGNORECASE),
                re.compile(r'deadlift', re.IGNORECASE),
                re.compile(r'curl', re.IGNORECASE),
                re.compile(r'press', re.IGNORECASE)
            ]
            
            print("\nSearching for exercise patterns...")
            for pattern in exercise_patterns:
                pattern_name = pattern.pattern
                matches = []
                
                # Search each cell in the DataFrame
                for i, row in df.iterrows():
                    for col, value in row.items():
                        if isinstance(value, str) and pattern.search(value):
                            matches.append((i, col, value))
                
                if matches:
                    print(f"\nFound {len(matches)} matches for exercise '{pattern_name}':")
                    for i, (row_idx, col, value) in enumerate(matches[:5]):  # Show first 5 matches
                        print(f"  Match {i+1}: Row {row_idx}, Column '{col}', Value: '{value}'")
                    if len(matches) > 5:
                        print(f"  ... and {len(matches) - 5} more matches")
            
            # Look for numeric patterns that might indicate sets/reps
            print("\nSearching for potential sets/reps patterns...")
            set_rep_patterns = [
                re.compile(r'^\d+$'),  # Just a number
                re.compile(r'^\d+[-x]\d+$'),  # Like "3-5" or "3x5"
                re.compile(r'^\d+\s*sets?', re.IGNORECASE),  # Like "3 sets"
                re.compile(r'^\d+\s*reps?', re.IGNORECASE)   # Like "8 reps"
            ]
            
            set_rep_matches = []
            for i, row in df.iterrows():
                for col, value in row.items():
                    if isinstance(value, str):
                        for pattern in set_rep_patterns:
                            if pattern.search(value):
                                set_rep_matches.append((i, col, value))
                                break
            
            if set_rep_matches:
                print(f"\nFound {len(set_rep_matches)} potential sets/reps indicators:")
                for i, (row_idx, col, value) in enumerate(set_rep_matches[:10]):  # Show first 10 matches
                    print(f"  Match {i+1}: Row {row_idx}, Column '{col}', Value: '{value}'")
                if len(set_rep_matches) > 10:
                    print(f"  ... and {len(set_rep_matches) - 10} more matches")
            
            # Try to identify the structure based on the first few rows with content
            print("\nAttempting to identify table structure...")
            
            # Find the first few non-empty rows
            non_empty_rows = []
            for i, row in df.iterrows():
                if not row.isna().all() and len(non_empty_rows) < 5:
                    non_empty_rows.append((i, row))
            
            for i, (row_idx, row) in enumerate(non_empty_rows):
                print(f"\nContent Row {i+1} (Excel row {row_idx+1}):")
                for col, value in row.items():
                    if not pd.isna(value):
                        print(f"  Column '{col}': '{value}'")
            
            # Break after examining the first sheet to keep output manageable
            if sheet_name == sheet_names[0]:
                print("\nExamining only the first sheet for brevity. Run again without the break to examine all sheets.")
                break
        
    except Exception as e:
        print(f"Error examining Excel file: {str(e)}")

def main():
    excel_file = "The Ultimate Push Pull Legs System - 6x (2).xlsx"
    examine_excel_content(excel_file)

if __name__ == '__main__':
    main()