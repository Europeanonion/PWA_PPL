#!/usr/bin/env python3

import json
import os
import re
from html import escape

def load_workout_data(json_file):
    """Load workout data from JSON file"""
    with open(json_file, 'r') as f:
        return json.load(f)

def generate_html(workout_data):
    """Generate HTML from workout data"""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Ultimate Push Pull Legs System</title>
    <style>
        :root {
            --primary-color: #C38803;
            --secondary-color: #404040;
            --background-color: #f5f5f7;
            --card-background: white;
            --text-color: #333;
            --link-color: #006CFF;
            --odd-row-color: #FEF7F0;
            --even-row-color: #FBF2EA;
            --notes-background: #f9f9f9;
            --substitution-background: #f0f8ff;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--background-color);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        header {
            background-color: #1a1a1a;
            color: white;
            text-align: center;
            padding: 20px;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        h1 {
            margin: 0;
            font-size: 24px;
        }
        
        .phase-selector {
            display: flex;
            justify-content: center;
            margin-top: 10px;
        }
        
        .phase-btn {
            background-color: #333;
            color: white;
            border: none;
            padding: 8px 12px;
            margin: 0 5px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .phase-btn.active {
            background-color: var(--primary-color);
        }
        
        .container {
            padding: 15px;
            max-width: 100%;
            margin: 0 auto;
        }
        
        .phase-content {
            display: none;
        }
        
        .phase-content.active {
            display: block;
        }
        
        .phase-description {
            background-color: var(--primary-color);
            color: white;
            padding: 12px 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
        
        .week-selector {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 15px;
            justify-content: center;
        }
        
        .week-btn {
            background-color: var(--secondary-color);
            color: white;
            border: none;
            padding: 8px 12px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .week-btn.active {
            background-color: var(--primary-color);
        }
        
        .week-content {
            display: none;
        }
        
        .week-content.active {
            display: block;
        }
        
        .workout-day {
            background-color: var(--card-background);
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .day-header {
            background-color: var(--primary-color);
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            font-size: 18px;
        }
        
        .exercise-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table-header {
            background-color: var(--secondary-color);
            color: white;
            padding: 10px 5px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        .exercise-row {
            border-bottom: 1px solid #eee;
        }
        
        .exercise-row:nth-child(odd) {
            background-color: var(--odd-row-color);
        }
        
        .exercise-row:nth-child(even) {
            background-color: var(--even-row-color);
        }
        
        .exercise-name {
            padding: 12px 10px;
            font-weight: 500;
        }
        
        .exercise-data {
            padding: 12px 5px;
            text-align: center;
            font-size: 14px;
        }
        
        .exercise-link {
            color: var(--link-color);
            text-decoration: none;
        }
        
        .info-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            background-color: var(--link-color);
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 16px;
            font-size: 12px;
            margin-left: 5px;
            cursor: pointer;
        }
        
        .exercise-notes {
            display: none;
            background-color: var(--notes-background);
            padding: 10px;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        
        .substitutions {
            display: none;
            background-color: var(--substitution-background);
            padding: 10px;
            font-size: 14px;
            border-top: 1px solid #eee;
        }
        
        .sub-btn {
            background-color: #e0e0e0;
            border: none;
            padding: 6px 10px;
            margin-top: 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .weight-input {
            width: 50px;
            padding: 4px;
            text-align: center;
            border: 1px solid #ddd;
            border-radius: 3px;
        }
        
        .checkbox-container {
            display: flex;
            justify-content: center;
            gap: 5px;
        }
        
        footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            background-color: #e5e5e7;
        }
        
        /* For iPhone compatibility */
        @media (max-width: 414px) {
            .table-header {
                font-size: 12px;
                padding: 8px 2px;
            }
            
            .exercise-name {
                font-size: 14px;
                padding: 10px 5px;
            }
            
            .exercise-data {
                font-size: 12px;
                padding: 10px 2px;
            }
            
            .weight-input {
                width: 40px;
                padding: 2px;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>The Ultimate Push Pull Legs System</h1>
        <div class="phase-selector">
            <button class="phase-btn active" onclick="showPhase('phase1')">Phase 1</button>
            <button class="phase-btn" onclick="showPhase('phase2')">Phase 2</button>
            <button class="phase-btn" onclick="showPhase('phase3')">Phase 3</button>
        </div>
    </header>
    
    <div class="container">
"""

    # Generate content for each phase
    for phase_num in range(1, 4):
        phase_key = f"phase{phase_num}"
        phase_data = workout_data["phases"].get(phase_key, {})
        phase_description = phase_data.get("description", f"Phase {phase_num}")
        
        # Phase content div
        active_class = "active" if phase_num == 1 else ""
        html += f"""
        <!-- PHASE {phase_num} -->
        <div id="{phase_key}" class="phase-content {active_class}">
            <div class="phase-description">{phase_description}</div>
            
            <div class="week-selector">
"""
        
        # Week buttons
        for week_num in range(1, 7):
            week_key = f"week{week_num}"
            active_class = "active" if week_num == 1 else ""
            html += f"""                <button class="week-btn {active_class}" onclick="showWeek('{phase_key}', '{week_key}')">Week {week_num}</button>
"""
        
        html += """            </div>
            
"""
        
        # Week content
        for week_num in range(1, 7):
            week_key = f"week{week_num}"
            week_data = phase_data.get("weeks", {}).get(week_key, {})
            active_class = "active" if week_num == 1 else ""
            
            html += f"""            <!-- Week {week_num} Content -->
            <div id="{phase_key}-{week_key}" class="week-content {active_class}">
"""
            
            # If we have data for this week
            if week_data:
                # Generate workout days
                for day_type in ["push1", "pull1", "legs1", "push2", "pull2", "legs2"]:
                    day_data = week_data.get(day_type, [])
                    if day_data:
                        day_name = day_type.replace("1", " #1").replace("2", " #2").title()
                        
                        html += f"""                <!-- {day_name} -->
                <div class="workout-day">
                    <div class="day-header">{day_name}</div>
                    <table class="exercise-table">
                        <tr>
                            <th class="table-header" style="width: 35%;">Exercise</th>
                            <th class="table-header" style="width: 15%;">Warm-up</th>
                            <th class="table-header" style="width: 15%;">Working</th>
                            <th class="table-header" style="width: 15%;">Reps</th>
                            <th class="table-header" style="width: 10%;">RPE</th>
                            <th class="table-header" style="width: 10%;">Rest</th>
                        </tr>
                        
"""
                        
                        # Generate exercises
                        for i, exercise in enumerate(day_data):
                            exercise_id = f"{phase_key}-{week_key}-{day_type}-ex{i}"
                            notes_id = f"{exercise_id}-notes"
                            subs_id = f"{exercise_id}-subs"
                            
                            # Clean up exercise name for ID
                            clean_name = re.sub(r'[^a-zA-Z0-9]', '-', exercise["name"].lower())
                            
                            # Exercise row
                            html += f"""                        <tr class="exercise-row">
                            <td class="exercise-name">
                                <a href="#" class="exercise-link">{exercise["name"]}</a>
                                <span class="info-icon" onclick="toggleNotes('{notes_id}')">i</span>
                            </td>
                            <td class="exercise-data">{exercise["warmup_sets"]}</td>
                            <td class="exercise-data">{exercise["working_sets"]}</td>
                            <td class="exercise-data">{exercise["reps"]}</td>
                            <td class="exercise-data">{exercise["rpe"]}</td>
                            <td class="exercise-data">{exercise["rest"]}</td>
                        </tr>
                        <tr id="{notes_id}" class="exercise-notes">
                            <td colspan="6">
                                <strong>Notes:</strong> {exercise["notes"]}
"""
                            
                            # Add substitutions if available
                            if exercise["substitution1"] or exercise["substitution2"]:
                                html += f"""                                <br><br>
                                <button class="sub-btn" onclick="toggleSubs('{subs_id}')">Show Substitutions</button>
                                <div id="{subs_id}" class="substitutions">
                                    <strong>Substitution Options:</strong>
"""
                                if exercise["substitution1"]:
                                    html += f"""                                    <br>1. {exercise["substitution1"]}
"""
                                if exercise["substitution2"]:
                                    html += f"""                                    <br>2. {exercise["substitution2"]}
"""
                                html += """                                </div>
"""
                            
                            html += """                            </td>
                        </tr>
                        
"""
                        
                        html += """                    </table>
                </div>
                
"""
            else:
                # Placeholder for weeks without data
                html += f"""                <div class="workout-day">
                    <div class="day-header">Week {week_num}</div>
                    <p style="padding: 20px; text-align: center;">Week {week_num} content would follow the same structure as Week 1, with progressive overload applied.</p>
                </div>
"""
            
            html += """            </div>
            
"""
        
        html += """        </div>
        
"""
    
    # Footer and JavaScript
    html += """    </div>
    
    <footer>
        <p>The Ultimate Push Pull Legs System - Save this page for offline use</p>
        <p>To use offline: Open in Safari, tap share icon, then "Add to Home Screen"</p>
        <p>Each phase is 6 weeks long. Complete all three phases for maximum results.</p>
    </footer>
    
    <script>
        // Initialize localStorage if it doesn't exist
        if (!localStorage.getItem('pplWorkoutData')) {
            localStorage.setItem('pplWorkoutData', JSON.stringify({}));
        }
        
        function showPhase(phaseId) {
            // Hide all phase content
            const phaseContents = document.querySelectorAll('.phase-content');
            phaseContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Deactivate all phase buttons
            const phaseButtons = document.querySelectorAll('.phase-btn');
            phaseButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected phase content
            document.getElementById(phaseId).classList.add('active');
            
            // Activate selected phase button
            const activeButton = document.querySelector(`.phase-btn[onclick="showPhase('${phaseId}')"]`);
            activeButton.classList.add('active');
            
            // Reset week selection for the selected phase
            showWeek(phaseId, 'week1');
        }
        
        function showWeek(phaseId, weekId) {
            // Hide all week content for the current phase
            const weekContents = document.querySelectorAll(`#${phaseId} .week-content`);
            weekContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Deactivate all week buttons for the current phase
            const weekButtons = document.querySelectorAll(`#${phaseId} .week-btn`);
            weekButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected week content
            document.getElementById(`${phaseId}-${weekId}`).classList.add('active');
            
            // Activate selected week button
            const activeButton = document.querySelector(`#${phaseId} .week-btn[onclick="showWeek('${phaseId}', '${weekId}')"]`);
            activeButton.classList.add('active');
        }
        
        function toggleNotes(noteId) {
            const notesElement = document.getElementById(noteId);
            if (notesElement.style.display === 'table-row') {
                notesElement.style.display = 'none';
            } else {
                notesElement.style.display = 'table-row';
            }
        }
        
        function toggleSubs(subsId) {
            const subsElement = document.getElementById(subsId);
            if (subsElement.style.display === 'block') {
                subsElement.style.display = 'none';
            } else {
                subsElement.style.display = 'block';
            }
        }
        
        function saveWeight(exerciseId, setIndex, value) {
            const workoutData = JSON.parse(localStorage.getItem('pplWorkoutData'));
            
            // Parse the exerciseId to get phase, week, day, and exercise
            const [phase, week, day, exNum] = exerciseId.split('-');
            
            // Initialize nested objects if they don't exist
            if (!workoutData[phase]) workoutData[phase] = {};
            if (!workoutData[phase][week]) workoutData[phase][week] = {};
            if (!workoutData[phase][week][day]) workoutData[phase][week][day] = {};
            if (!workoutData[phase][week][day][exNum]) workoutData[phase][week][day][exNum] = {
                weights: [],
                completed: []
            };
            
            // Save the weight
            workoutData[phase][week][day][exNum].weights[setIndex] = value;
            
            // Save to localStorage
            localStorage.setItem('pplWorkoutData', JSON.stringify(workoutData));
        }
        
        function toggleCompleted(exerciseId, setIndex, checked) {
            const workoutData = JSON.parse(localStorage.getItem('pplWorkoutData'));
            
            // Parse the exerciseId to get phase, week, day, and exercise
            const [phase, week, day, exNum] = exerciseId.split('-');
            
            // Initialize nested objects if they don't exist
            if (!workoutData[phase]) workoutData[phase] = {};
            if (!workoutData[phase][week]) workoutData[phase][week] = {};
            if (!workoutData[phase][week][day]) workoutData[phase][week][day] = {};
            if (!workoutData[phase][week][day][exNum]) workoutData[phase][week][day][exNum] = {
                weights: [],
                completed: []
            };
            
            // Save the completion status
            workoutData[phase][week][day][exNum].completed[setIndex] = checked;
            
            // Save to localStorage
            localStorage.setItem('pplWorkoutData', JSON.stringify(workoutData));
        }
    </script>
</body>
</html>
"""
    
    return html

def main():
    # Load workout data
    json_file = "The Ultimate Push Pull Legs System - 6x (2)_workout_data.json"
    workout_data = load_workout_data(json_file)
    
    # Generate HTML
    html = generate_html(workout_data)
    
    # Write HTML to file
    with open("ppl-workout-html.html", "w") as f:
        f.write(html)
    
    print(f"HTML file generated: ppl-workout-html.html")

if __name__ == "__main__":
    main()