# Push-Pull-Legs Workout App Development Memory Bank

## Project Overview
- **Project Name**: Ultimate Push-Pull-Legs Workout Tracker
- **Main File**: ppl-workout-html.html
- **Start Date**: March 16, 2025
- **Primary Goal**: Create a comprehensive workout tracking system with progression through phases and weeks

## Current Development Status

### 2025-03-16 Initial Setup

#### Current Focus
- Phase 1, Week 1 basic structure and content
- Fixing orphaned HTML elements in the main file
- Implementing core JavaScript functionality

#### Completed Components
- Basic HTML structure with responsive design
- CSS styling framework for workout tables
- Phase selection navigation
- Week selection buttons
- Initial table structure for some workout days

#### Pending Components
- Complete exercise data for all workout days in Phase 1, Week 1
- Fix incomplete table structures
- Implement proper JavaScript functions for toggling notes and substitutions
- Add input fields for weight tracking

#### Blockers/Issues
- Some table rows appear to be outside their parent tables in the HTML
- Need to ensure consistent structure across all workout days

## Implementation Decisions

### Data Structure
- Using a hierarchical data structure organized by phase → week → day → exercise
- Exercise data will include sets, reps, RPE, rest periods, and notes
- Planning to implement localStorage for data persistence between sessions

### UI Decisions
- Using a tabbed interface for phases and weeks to maintain a clean UI
- Exercise notes and substitutions will be collapsible to save screen space
- Will implement dedicated input fields for logging weights and completed sets

## Data Structures

### Exercise Data Structure
```javascript
{
  "name": "Bench Press",
  "sets": 4,
  "reps": "5-8",
  "rpe": "8-9",
  "rest": "3-4m",
  "notes": "Keep shoulders retracted, feet firmly planted...",
  "link": "https://www.example.com/bench-press-tutorial",
  "substitutions": [
    "Dumbbell Press",
    "Floor Press",
    "Machine Chest Press"
  ]
}
```

### Workout Progress Structure
```javascript
{
  "phase1": {
    "week1": {
      "push1": {
        "date": "2025-03-16",
        "exercises": {
          "benchPress": {
            "weights": ["135", "155", "175", "175"],
            "completed": [true, true, true, false],
            "notes": "Felt strong today"
          },
          // Additional exercises
        }
      }
      // Additional workout days
    }
    // Additional weeks
  }
  // Additional phases
}
```

## Technical Requirements

### Browser Support
- Primary support: Chrome, Safari, Firefox (latest versions)
- Mobile support: iOS Safari, Android Chrome
- Ensure mobile responsive design works on screens down to 320px width

### Storage Limits
- localStorage has ~5MB limit per domain
- Need to monitor data size as workout history accumulates
- May need to implement data pruning for extended usage

## Next Steps

### Immediate Tasks
1. Fix HTML structure issues in main file
2. Complete Push Day 1 exercises with all required data
3. Implement toggleNotes() and toggleSubs() JavaScript functions
4. Create consistent table structure for all workout days
5. Add exercise links for all Phase 1, Week 1 exercises

### Short-term Goals
1. Complete all content for Phase 1, Week 1
2. Implement basic localStorage saving for workout data
3. Add input fields for weight tracking
4. Add checkboxes for completed sets
5. Test on mobile devices

## Reference Materials

### RPE Scale Reference
- RPE 10: Maximum effort, could not do more reps
- RPE 9: Could do 1 more rep
- RPE 8: Could do 2 more reps
- RPE 7: Could do 3 more reps
- RPE 6: Could do 4 more reps
- RPE 5: Could do 5 more reps

### Workout Structure
- **Push**: Chest, shoulders, triceps
- **Pull**: Back, biceps, rear delts
- **Legs**: Quadriceps, hamstrings, calves, glutes

## Testing Notes
- Need to test storage functionality across multiple devices
- Ensure all exercise links open in new tabs correctly
- Verify that all collapsible sections work properly

## Development Updates

### 2025-03-16 Development Update

#### Completed Since Last Update
- Created detailed implementation plan
- Set up project structure with all needed files
- Attempted Excel content analysis automation
- Created initial documentation in memory bank

#### Current Status
- Working on: Fixing HTML structure issues and completing Phase 1, Week 1 content
- Completed: Basic app framework with navigation tabs and styling
- Pending: Exercise data completion, localStorage implementation
- Progress on milestones: Core Structure (~25% complete)

#### Implementation Details
- Decided to prioritize manual content completion over automated Excel parsing
- Current HTML structure has orphaned table rows that need to be properly organized
- Excel analysis script was created but needs refinement to properly extract workout data
- Will focus on client-side PWA approach with localStorage as primary data storage

#### Next Steps
1. Fix HTML structure by organizing all orphaned table rows
2. Complete Push Day 1 content with proper exercise details
3. Ensure all JavaScript functions work correctly
4. Add weight tracking input fields to exercise rows
5. Implement localStorage foundation for saving workout progress

#### Issues/Questions
- Need to determine the most user-friendly structure for inputting weights/reps
- Consider how to handle substitution exercises in the workout tracking
- May need a more condensed mobile view for exercise tables