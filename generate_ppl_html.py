#!/usr/bin/env python3

import json
import os
import argparse
from html import escape

def generate_html_from_analysis(analysis_file):
    """
    Generates HTML structure for the PPL workout app based on analysis JSON.
    
    Args:
        analysis_file (str): Path to the analysis JSON file
    
    Returns:
        str: Generated HTML content
    """
    print(f"Generating HTML from analysis file: {analysis_file}")
    
    try:
        # Load the analysis data
        with open(analysis_file, 'r') as f:
            analysis = json.load(f)
        
        # Generate HTML structure
        html = generate_ppl_html_structure(analysis)
        
        # Save the HTML to a file
        output_file = os.path.splitext(analysis_file)[0] + ".html"
        with open(output_file, 'w') as f:
            f.write(html)
        
        print(f"HTML generated successfully. Saved to {output_file}")
        
        return html
        
    except Exception as e:
        print(f"Error generating HTML: {str(e)}")
        return None

def generate_exercise_id(name):
    """
    Generate a safe ID from exercise name for HTML/JS.
    
    Args:
        name (str): Exercise name
        
    Returns:
        str: Safe ID
    """
    # Remove non-alphanumeric characters and convert spaces to hyphens
    safe_id = ''.join(c for c in name.lower().replace(' ', '-') if c.isalnum() or c == '-')
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

def generate_ppl_html_structure(analysis):
    """
    Creates the full HTML structure for the PPL workout app.
    
    Args:
        analysis (dict): The analysis data
    
    Returns:
        str: Complete HTML document
    """
    program_structure = analysis["program_structure"]
    workout_data = analysis["workout_data"]
    
    # Start building HTML
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Ultimate Push Pull Legs System</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
            background-color: #f9f9f9;
        }
        
        header {
            background-color: #C38803;
            color: white;
            padding: 15px;
            text-align: center;
            margin-bottom: 20px;
            border-radius: 0 0 10px 10px;
        }
        
        h1 {
            margin: 0;
            font-size: 28px;
        }
        
        .phase-selector {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .phase-btn {
            padding: 10px 20px;
            margin: 0 5px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .phase-btn.active {
            background-color: #C38803;
            color: white;
        }
        
        .container {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .phase-content {
            display: none;
        }
        
        .phase-content.active {
            display: block;
        }
        
        .phase-description {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #C38803;
        }
        
        .week-selector {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
        
        .week-btn {
            padding: 8px 15px;
            margin: 5px;
            background-color: #f0f0f0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            flex-grow: 1;
            text-align: center;
            transition: all 0.3s;
        }
        
        .week-btn.active {
            background-color: #C38803;
            color: white;
        }
        
        .week-content {
            display: none;
        }
        
        .week-content.active {
            display: block;
        }
        
        .workout-day {
            margin-bottom: 30px;
        }
        
        .day-header {
            background-color: #404040;
            color: white;
            padding: 10px 15px;
            margin-bottom: 15px;
            border-radius: 5px;
        }
        
        .exercise-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .table-header {
            background-color: #404040;
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
            background-color: #FEF7F0;
        }
        
        .exercise-row:nth-child(even) {
            background-color: #FBF2EA;
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
            color: #006CFF;
            text-decoration: none;
        }
        
        .info-icon {
            display: inline-block;
            width: 16px;
            height: 16px;
            background-color: #006CFF;
            color: white;
            border-radius: 50%;
            text-align: center;
            font-size: 12px;
            line-height: 16px;
            margin-left: 5px;
            cursor: pointer;
        }
        
        .exercise-notes {
            display: none;
        }
        
        .notes-content {
            padding: 15px;
            background-color: #f9f9f9;
            font-size: 14px;
            border-left: 3px solid #006CFF;
        }
        
        .substitutions {
            display: none;
        }
        
        .subs-content {
            padding: 15px;
            background-color: #f9f9f9;
            font-size: 14px;
            border-left: 3px solid #28a745;
        }
        
        @media (max-width: 768px) {
            .week-btn {
                flex-basis: calc(33.333% - 10px);
            }
            
            .exercise-table {
                font-size: 13px;
            }
            
            .table-header, .exercise-data {
                padding: 8px 3px;
            }
        }
        
        @media (max-width: 480px) {
            .week-btn {
                flex-basis: calc(50% - 10px);
            }
            
            .exercise-table {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>The Ultimate Push Pull Legs System</h1>
    </header>
    
    <div class="container">
        <div class="phase-selector">
"""
    
    # Add phase selector buttons
    for phase in sorted(program_structure["phases"]):
        active_class = "active" if phase == 1 else ""
        html += f'            <button class="phase-btn {active_class}" data-phase="{phase}" onclick="showPhase({phase})">Phase {phase}</button>\n'
    
    html += """        </div>
        
"""
    
    # Add content for each phase
    for phase in sorted(program_structure["phases"]):
        phase_key = f"phase{phase}"
        active_class = "active" if phase == 1 else ""
        
        html += f"""        <div id="phase{phase}" class="phase-content {active_class}">
            <div class="phase-description">
                <h2>Phase {phase}</h2>
                <p>This phase focuses on {get_phase_description(phase)}. Follow the program as written for best results.</p>
            </div>
            
            <div class="week-selector">
"""
        
        # Add week selector buttons for this phase
        for week in range(1, program_structure["weeks_per_phase"] + 1):
            active_class = "active" if week == 1 else ""
            html += f'                <button class="week-btn {active_class}" data-week="{week}" onclick="showWeek({phase}, {week})">Week {week}</button>\n'
        
        html += """            </div>
            
"""
        
        # Add content for each week in this phase
        for week in range(1, program_structure["weeks_per_phase"] + 1):
            week_key = f"week{week}"
            active_class = "active" if week == 1 else ""
            
            html += f"""            <div class="week{week} week-content {active_class}">
"""
            
            # Add content for each workout day in this week
            if phase_key in workout_data and week_key in workout_data[phase_key]:
                for day_key, exercises in workout_data[phase_key][week_key].items():
                    # Format day name for display
                    day_type = day_key[:-1].capitalize()  # Extract 'push', 'pull', or 'legs' and capitalize
                    day_num = day_key[-1]
                    
                    html += f"""                <div class="workout-day">
                    <h3 class="day-header">{day_type} Day #{day_num}</h3>
                    <table class="exercise-table">
                        <tr>
                            <th class="table-header" style="width: 30%;">Exercise</th>
                            <th class="table-header" style="width: 8%;">Sets</th>
                            <th class="table-header" style="width: 10%;">Reps</th>
                            <th class="table-header" style="width: 12%;">Rest</th>
                            <th class="table-header" style="width: 8%;">RPE</th>
                            <th class="table-header" style="width: 10%;">Demo</th>
                        </tr>
"""
                    
                    # Add exercises
                    for ex in exercises:
                        if 'name' in ex:
                            # Generate a safe exercise ID for JavaScript functions
                            ex_id = generate_exercise_id(ex['name'])
                            
                            html += f"""                        <tr class="exercise-row">
                            <td class="exercise-name">{escape(ex['name'])} <span class="info-icon" onclick="toggleNotes('{ex_id}')">i</span></td>
                            <td class="exercise-data">{ex.get('sets', '')}</td>
                            <td class="exercise-data">{ex.get('reps', '')}</td>
                            <td class="exercise-data">{ex.get('rest', '')}</td>
                            <td class="exercise-data">{ex.get('rpe', '')}</td>
                            <td class="exercise-data"><a href="#" class="exercise-link" target="_blank">View</a></td>
                        </tr>
                        <tr id="{ex_id}-notes" class="exercise-notes">
                            <td colspan="6">
                                <div class="notes-content">
                                    <strong>Form Notes:</strong>
                                    <p>{ex.get('notes', 'Focus on proper form and technique.')}</p>
                                    <button onclick="toggleSubs('{ex_id}')">View Substitutions</button>
                                </div>
                            </td>
                        </tr>
                        <tr id="{ex_id}-subs" class="substitutions">
                            <td colspan="6">
                                <div class="subs-content">
                                    <strong>Substitutions:</strong>
                                    <ul>
                                        <li>Alternative 1</li>
                                        <li>Alternative 2</li>
                                    </ul>
                                </div>
                            </td>
                        </tr>
"""
                    
                    html += """                    </table>
                </div>
"""
            
            html += """            </div>
"""
        
        html += """        </div>
"""
    
    # Add JavaScript functions
    html += """    </div>
    
    <footer>
        <p>&copy; 2025 Push Pull Legs Workout System</p>
    </footer>
    
    <script>
        function showPhase(phaseNumber) {
            // Hide all phases
            document.querySelectorAll('.phase-content').forEach(phase => {
                phase.classList.remove('active');
            });
            
            // Show selected phase
            document.getElementById(`phase${phaseNumber}`).classList.add('active');
            
            // Update active button
            document.querySelectorAll('.phase-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`.phase-btn[data-phase="${phaseNumber}"]`).classList.add('active');
            
            // Default to first week
            showWeek(phaseNumber, 1);
        }
        
        function showWeek(phaseNumber, weekNumber) {
            // Hide all weeks in current phase
            document.querySelectorAll(`#phase${phaseNumber} .week-content`).forEach(week => {
                week.classList.remove('active');
            });
            
            // Show selected week
            document.querySelector(`#phase${phaseNumber} .week${weekNumber}`).classList.add('active');
            
            // Update active button
            document.querySelectorAll(`#phase${phaseNumber} .week-btn`).forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`#phase${phaseNumber} .week-btn[data-week="${weekNumber}"]`).classList.add('active');
        }
        
        function toggleNotes(exerciseId) {
            const notesRow = document.getElementById(`${exerciseId}-notes`);
            if (notesRow.style.display === 'table-row') {
                notesRow.style.display = 'none';
            } else {
                // Hide all other notes first
                document.querySelectorAll('.exercise-notes').forEach(note => {
                    note.style.display = 'none';
                });
                notesRow.style.display = 'table-row';
            }
        }
        
        function toggleSubs(exerciseId) {
            const subsRow = document.getElementById(`${exerciseId}-subs`);
            if (subsRow.style.display === 'table-row') {
                subsRow.style.display = 'none';
            } else {
                // Hide all other substitution rows first
                document.querySelectorAll('.substitutions').forEach(sub => {
                    sub.style.display = 'none';
                });
                subsRow.style.display = 'table-row';
            }
        }
    </script>
</body>
</html>"""
    
    return html

def main():
    parser = argparse.ArgumentParser(description='Generate HTML from workout analysis JSON')
    parser.add_argument('analysis_file', help='Path to the analysis JSON file')
    args = parser.parse_args()
    
    if not os.path.isfile(args.analysis_file):
        print(f"Error: File {args.analysis_file} not found")
        return
    
    generate_html_from_analysis(args.analysis_file)

if __name__ == '__main__':
    main()