# Detailed Implementation Plan for Push-Pull-Legs Workout PWA

This document provides specific implementation details for each development phase to maintain focus on delivering a high-quality, client-side Progressive Web App.

## Phase 1: Complete Basic HTML App (Core Focus)

### 1. Fix Current HTML Structure (Priority: HIGH)
- [ ] **Repair document structure**
  - Move orphaned table rows into proper parent tables
  - Ensure proper nesting of all HTML elements
  - Validate HTML structure with W3C validator
  - Focus on maintaining table structure consistency for all workout days

- [ ] **Complete navigation structure**
  - Finish phase selector implementation
  - Implement week navigation buttons with proper event handlers
  - Add smooth transitions between views

### 2. Complete Core Workout Content (Priority: HIGH)
- [ ] **Phase 1, Week 1 content**
  - **Push Day #1**: Complete all exercises with proper data structure
    - Add bench press variations with proper form notes
    - Include shoulder press exercises with technique tips
    - Complete tricep isolation exercises with substitution options
  - **Push Day #2**: Create full exercise table with identical structure
    - Focus on different chest exercises than day 1
    - Include shoulder variations and tricep movements
  - **Pull Day #1**: Complete all exercises with proper data structure
    - Add vertical pulling movements (pulldowns, chinups)
    - Include horizontal pulling (rows) with proper form cues
    - Add bicep isolation exercises with progression options
  - **Pull Day #2**: Create full exercise table with identical structure
    - Focus on different back exercises than day 1
    - Include rear delt work and bicep variations
  - **Legs Day #1**: Complete all exercises with proper data structure
    - Include quad-focused movements (squats, leg extensions)
    - Add hamstring exercises with form guidance
    - Complete with calf and core movements
  - **Legs Day #2**: Create full exercise table with identical structure
    - Focus on different leg exercises than day 1
    - Include hip-hinge movements (deadlifts, RDLs)
    - Add accessory movements for calves and core

- [ ] **Add exercise details**
  - Source proper instructional links for each exercise (YouTube preferred)
  - Create detailed form notes for each exercise
  - Add 2-3 substitution options per exercise
  - Include RPE guidelines for proper intensity management

### 3. Implement Core JavaScript Functionality (Priority: HIGH)
- [ ] **Navigation functions**
  ```javascript
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
  ```

- [ ] **Notes and substitutions toggle functions**
  ```javascript
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
  ```

### 4. Extend to All Phases and Weeks (Priority: MEDIUM)
- [ ] **Create template structure first**
  - Build a consistent template for each workout day type
  - Create a pattern for exercise progression across weeks
  - Document exercise variations for each phase

- [ ] **Manual content population instead of Excel automation**
  - Focus on completing one phase at a time
  - Use consistent exercise selection within each phase
  - Implement progressive overload patterns between phases
  
- [ ] **Content population order**
  - Phase 1, Week 1 (all days) - PRIORITY
  - Phase 1, Weeks 2-6
  - Phase 2, Weeks 1-6
  - Phase 3, Weeks 1-6

### 5. Mobile Optimization (Priority: HIGH)
- [ ] **Responsive design refinement**
  - Test on multiple device sizes (320px to 1920px width)
  - Adjust table layouts for small screens
  - Implement touch-friendly UI elements

- [ ] **Performance optimization**
  - Minimize DOM operations
  - Optimize CSS selector performance
  - Implement content lazy-loading for phases/weeks

## Phase 2: Local Storage Implementation (Core Functionality)

### 1. Design Data Structure (Priority: HIGH)
- [ ] **Define storage schema**
  ```javascript
  // Core data structure
  const workoutData = {
    "settings": {
      "units": "lbs", // or "kg"
      "darkMode": false,
      "notifications": false
    },
    "currentPhase": 1,
    "currentWeek": 1,
    "progress": {
      "phase1": {
        "week1": {
          "push1": {
            "date": "2025-03-16",
            "completed": true,
            "exercises": {
              "benchPress": {
                "sets": [
                  {"weight": 135, "reps": 8, "completed": true},
                  {"weight": 155, "reps": 6, "completed": true},
                  {"weight": 175, "reps": 5, "completed": true},
                  {"weight": 175, "reps": 5, "completed": false}
                ],
                "notes": "Felt strong today"
              }
              // Additional exercises
            }
          }
          // Other workout days
        }
        // Other weeks
      }
      // Other phases
    },
    "personalRecords": {
      "benchPress": {
        "weight": 225,
        "reps": 5,
        "date": "2025-03-10"
      }
      // Other exercises
    }
  };
  ```

### 2. Create Input UI Elements (Priority: HIGH)
- [ ] **Add tracking elements to exercise rows**
  ```html
  <tr class="exercise-row">
    <td class="exercise-name">Bench Press <span class="info-icon" onclick="toggleNotes('benchPress')">i</span></td>
    <td class="exercise-data">4</td>
    <td class="exercise-data">5-8</td>
    <td class="exercise-data">
      <div class="set-inputs">
        <div class="set-row">
          <input type="number" class="weight-input" data-exercise="benchPress" data-set="1" placeholder="lbs">
          <input type="number" class="rep-input" data-exercise="benchPress" data-set="1" placeholder="reps">
          <input type="checkbox" class="completed-checkbox" data-exercise="benchPress" data-set="1">
        </div>
        <!-- Repeat for sets 2-4 -->
      </div>
    </td>
    <td class="exercise-data">3-4m</td>
    <td class="exercise-data">8-9</td>
    <td class="exercise-data"><a href="#" class="exercise-link" target="_blank">View</a></td>
  </tr>
  ```

### 3. Implement Core Storage Functions (Priority: HIGH)
- [ ] **Basic storage management**
  ```javascript
  // Save all workout data
  function saveAllWorkoutData(data) {
    localStorage.setItem('pplWorkoutData', JSON.stringify(data));
  }
  
  // Load all workout data
  function loadAllWorkoutData() {
    return JSON.parse(localStorage.getItem('pplWorkoutData')) || createDefaultWorkoutData();
  }
  
  // Create default data structure
  function createDefaultWorkoutData() {
    return {
      "settings": {
        "units": "lbs",
        "darkMode": false
      },
      "currentPhase": 1,
      "currentWeek": 1,
      "progress": {},
      "personalRecords": {}
    };
  }
  
  // Save workout day progress
  function saveWorkoutDay(phase, week, day, exerciseData) {
    const allData = loadAllWorkoutData();
    
    if (!allData.progress[`phase${phase}`]) {
      allData.progress[`phase${phase}`] = {};
    }
    if (!allData.progress[`phase${phase}`][`week${week}`]) {
      allData.progress[`phase${phase}`][`week${week}`] = {};
    }
    
    allData.progress[`phase${phase}`][`week${week}`][day] = {
      date: new Date().toISOString().split('T')[0],
      completed: true,
      exercises: exerciseData
    };
    
    saveAllWorkoutData(allData);
    
    // Check for personal records
    updatePersonalRecords(exerciseData);
  }
  ```

### 4. Implement Data Collection (Priority: MEDIUM)
- [ ] **Auto-save functionality**
  ```javascript
  // Set up auto-save for input changes
  function setupAutoSave() {
    document.querySelectorAll('.weight-input, .rep-input, .completed-checkbox').forEach(input => {
      input.addEventListener('change', function() {
        const exercise = this.dataset.exercise;
        const set = this.dataset.set;
        const phaseId = getCurrentPhase();
        const weekId = getCurrentWeek();
        const dayId = getCurrentDay();
        
        saveExerciseSet(phaseId, weekId, dayId, exercise, set);
      });
    });
  }
  
  // Save specific exercise set data
  function saveExerciseSet(phase, week, day, exercise, set) {
    const weightInput = document.querySelector(`.weight-input[data-exercise="${exercise}"][data-set="${set}"]`);
    const repInput = document.querySelector(`.rep-input[data-exercise="${exercise}"][data-set="${set}"]`);
    const completedCheckbox = document.querySelector(`.completed-checkbox[data-exercise="${exercise}"][data-set="${set}"]`);
    
    const allData = loadAllWorkoutData();
    
    // Create object structure if it doesn't exist
    if (!allData.progress[`phase${phase}`]) allData.progress[`phase${phase}`] = {};
    if (!allData.progress[`phase${phase}`][`week${week}`]) allData.progress[`phase${phase}`][`week${week}`] = {};
    if (!allData.progress[`phase${phase}`][`week${week}`][day]) allData.progress[`phase${phase}`][`week${week}`][day] = {
      exercises: {}
    };
    if (!allData.progress[`phase${phase}`][`week${week}`][day].exercises[exercise]) {
      allData.progress[`phase${phase}`][`week${week}`][day].exercises[exercise] = {
        sets: []
      };
    }
    
    // Ensure sets array is long enough
    while (allData.progress[`phase${phase}`][`week${week}`][day].exercises[exercise].sets.length < set) {
      allData.progress[`phase${phase}`][`week${week}`][day].exercises[exercise].sets.push({});
    }
    
    // Update set data
    allData.progress[`phase${phase}`][`week${week}`][day].exercises[exercise].sets[set-1] = {
      weight: weightInput.value ? parseFloat(weightInput.value) : null,
      reps: repInput.value ? parseInt(repInput.value) : null,
      completed: completedCheckbox.checked
    };
    
    saveAllWorkoutData(allData);
    
    // Check if this is a personal record
    if (weightInput.value && repInput.value) {
      checkPersonalRecord(exercise, parseFloat(weightInput.value), parseInt(repInput.value));
    }
  }
  ```

### 5. Implement Data Display (Priority: MEDIUM)
- [ ] **Load saved data into UI**
  ```javascript
  // Load workout day data
  function loadWorkoutDay(phase, week, day) {
    const allData = loadAllWorkoutData();
    const dayData = allData.progress[`phase${phase}`]?.[`week${week}`]?.[day];
    
    if (!dayData) return; // No saved data
    
    // For each exercise in the saved data
    for (const exercise in dayData.exercises) {
      const exerciseData = dayData.exercises[exercise];
      
      // For each set
      exerciseData.sets.forEach((set, index) => {
        const setNum = index + 1;
        const weightInput = document.querySelector(`.weight-input[data-exercise="${exercise}"][data-set="${setNum}"]`);
        const repInput = document.querySelector(`.rep-input[data-exercise="${exercise}"][data-set="${setNum}"]`);
        const completedCheckbox = document.querySelector(`.completed-checkbox[data-exercise="${exercise}"][data-set="${setNum}"]`);
        
        if (weightInput && set.weight !== null) weightInput.value = set.weight;
        if (repInput && set.reps !== null) repInput.value = set.reps;
        if (completedCheckbox) completedCheckbox.checked = set.completed;
      });
    }
  }
  ```

## Phase 3: PWA Implementation (Final Enhancements)

### 1. Personal Records System (Priority: MEDIUM)
- [ ] **Personal records tracking**
  ```javascript
  // Check and update personal records
  function checkPersonalRecord(exercise, weight, reps) {
    if (!weight || !reps) return;
    
    const allData = loadAllWorkoutData();
    if (!allData.personalRecords) allData.personalRecords = {};
    
    const currentPR = allData.personalRecords[exercise];
    let isPR = false;
    
    // Calculate volume (weight * reps) as simple PR metric
    const volume = weight * reps;
    
    // If there's no PR yet or this is heavier
    if (!currentPR || weight > currentPR.weight) {
      isPR = true;
    } 
    // Same weight but more reps
    else if (weight === currentPR.weight && reps > currentPR.reps) {
      isPR = true;
    }
    // Different weight but higher volume (for lower weight, higher rep PRs)
    else if (volume > (currentPR.weight * currentPR.reps)) {
      isPR = true;
    }
    
    if (isPR) {
      allData.personalRecords[exercise] = {
        weight: weight,
        reps: reps,
        date: new Date().toISOString().split('T')[0],
        volume: volume
      };
      
      saveAllWorkoutData(allData);
      
      // Show PR notification
      showPRNotification(exercise, weight, reps);
    }
  }
  ```

### 2. Data Export/Import (Priority: MEDIUM)
- [ ] **Backup and restore functionality**
  ```javascript
  // Export workout data as JSON file
  function exportWorkoutData() {
    const allData = loadAllWorkoutData();
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', `ppl-workout-data-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(exportLink);
    
    exportLink.click();
    document.body.removeChild(exportLink);
  }
  
  // Import workout data from JSON file
  function importWorkoutData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function() {
        try {
          const data = JSON.parse(reader.result);
          
          // Validate data structure
          if (!data.progress || !data.settings) {
            alert('Invalid workout data format');
            return;
          }
          
          // Confirm before overwriting
          if (confirm('This will overwrite all existing workout data. Continue?')) {
            localStorage.setItem('pplWorkoutData', JSON.stringify(data));
            alert('Workout data imported successfully');
            location.reload();
          }
        } catch(e) {
          alert('Error importing data: ' + e.message);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }
  ```

### 3. PWA Features (Priority: MEDIUM)
- [ ] **Service worker implementation**
  ```javascript
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
  ```

- [ ] **Create manifest.json for PWA**
  ```json
  {
    "name": "Push-Pull-Legs Workout App",
    "short_name": "PPL Workout",
    "description": "Track your progress through the Push-Pull-Legs workout program",
    "start_url": "/index.html",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#C38803",
    "icons": [
      {
        "src": "icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

## Implementation Schedule: Revised Based on Findings

### Sprint 1: Core Structure & HTML Cleanup (1 week)
- Day 1-2: Fix HTML structure issues and repair orphaned elements
- Day 3-4: Complete Push Day 1 & Pull Day 1 content with proper exercise data
- Day 5-7: Implement JavaScript functions and test basic functionality

### Sprint 2: Complete Phase 1, Week 1 (1 week)
- Day 1-2: Finish Push Day 2 & Pull Day 2 content
- Day 3-4: Complete Legs Day 1 & 2 content
- Day 5-7: Add all exercise links, notes and substitutions

### Sprint 3: LocalStorage Implementation (1 week)
- Day 1-2: Add input fields for tracking weights and reps
- Day 3-5: Implement localStorage save/load functions
- Day 6-7: Add personal records tracking

### Sprint 4: Complete Core App (Ongoing)
- Content population for remaining phases and weeks
- Progressive enhancements for UI and functionality
- PWA implementation and offline capabilities