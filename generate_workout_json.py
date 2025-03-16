#!/usr/bin/env python3
"""
Script to generate workout JSON files for the PPL workout app.
This script reads the workout data from the source JSON file and
transforms it into the format required by the app.
"""

import json
import os
import urllib.parse

# Source file containing all workout data
SOURCE_FILE = "The Ultimate Push Pull Legs System - 6x (2)_workout_data.json"

# Output directory for the generated JSON files
OUTPUT_DIR = "ppl-workout/dev/exercise-data"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_exercise_id(name):
    """Generate a kebab-case ID from an exercise name."""
    # Convert to lowercase and replace spaces with hyphens
    return name.lower().replace(" ", "-").replace("(", "").replace(")", "").replace(",", "")

def generate_exercise_link(name):
    """Generate a YouTube search link for the exercise."""
    # Create a search query for "how to do [exercise name]"
    search_query = f"how to do {name} exercise form"
    # URL encode the search query
    encoded_query = urllib.parse.quote(search_query)
    # Return the YouTube search URL
    return f"https://www.youtube.com/results?search_query={encoded_query}"

def transform_exercise(exercise):
    """Transform an exercise from the source format to the app format."""
    # Create a unique ID for the exercise
    exercise_id = generate_exercise_id(exercise["name"])
    
    # Format the rest time (remove ~ and convert to shorter format)
    rest = exercise.get("rest", "")
    if rest:
        rest = rest.replace("~", "").replace(" min", "m")
    
    # Create substitutions array from substitution1 and substitution2
    substitutions = []
    if "substitution1" in exercise and exercise["substitution1"]:
        substitutions.append(exercise["substitution1"])
    if "substitution2" in exercise and exercise["substitution2"]:
        substitutions.append(exercise["substitution2"])
    
    # Generate a YouTube search link for the exercise
    link = generate_exercise_link(exercise["name"])
    
    # Create the transformed exercise
    transformed = {
        "id": exercise_id,
        "name": exercise["name"],
        "warmup_sets": exercise.get("warmup_sets", ""),
        "working_sets": exercise.get("working_sets", ""),
        "reps": exercise.get("reps", ""),
        "rpe": exercise.get("rpe", ""),
        "rest": rest,
        "link": link,
        "notes": exercise.get("notes", ""),
        "substitutions": substitutions
    }
    
    return transformed

def generate_workout_file(phase, week, data):
    """Generate a workout JSON file for a specific phase and week."""
    # Get the phase description
    phase_data = data["phases"][f"phase{phase}"]
    phase_description = phase_data["description"]
    
    # Check if the week data exists
    if f"week{week}" not in phase_data["weeks"]:
        print(f"Skipping phase{phase}-week{week}.json - data not found in source file")
        return False
    
    # Get the week data
    week_data = phase_data["weeks"][f"week{week}"]
    
    # Create the output structure
    output = {
        "phase": phase,
        "week": week,
        "description": phase_description,
        "days": {}
    }
    
    # Process each day in the week
    for day, exercises in week_data.items():
        # Skip if not a valid day
        if not isinstance(exercises, list):
            continue
            
        # Determine the day title
        day_title = day.capitalize()
        if day.startswith("push"):
            day_title = f"Push #{day[-1]}"
        elif day.startswith("pull"):
            day_title = f"Pull #{day[-1]}"
        elif day.startswith("legs"):
            day_title = f"Legs #{day[-1]}"
        
        # Transform exercises
        transformed_exercises = [transform_exercise(ex) for ex in exercises]
        
        # Add to output
        output["days"][day] = {
            "title": day_title,
            "exercises": transformed_exercises
        }
    
    # Write to file
    filename = f"{OUTPUT_DIR}/phase{phase}-week{week}.json"
    with open(filename, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Generated {filename}")
    return True

def update_existing_files_with_links():
    """Update existing JSON files with exercise links."""
    # Get a list of all JSON files in the output directory
    json_files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.json')]
    
    updated_count = 0
    
    for filename in json_files:
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Read the file
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Flag to track if the file needs to be updated
        needs_update = False
        
        # Update links for each exercise in each day
        for day_key, day_data in data['days'].items():
            for exercise in day_data['exercises']:
                # If the link is empty, generate a new one
                if not exercise['link']:
                    exercise['link'] = generate_exercise_link(exercise['name'])
                    needs_update = True
        
