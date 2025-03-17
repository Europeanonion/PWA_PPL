/**
 * Workout Storage Module
 * Handles all localStorage operations for the PPL Workout Tracker
 */

// Default data structure for new users
const DEFAULT_WORKOUT_DATA = {
  settings: {
    units: "lbs",
    darkMode: false,
    notifications: false
  },
  currentPhase: 1,
  currentWeek: 1,
  progress: {},
  personalRecords: {}
};

/**
 * Initialize localStorage with default data if it doesn't exist
 */
function initializeWorkoutData() {
  if (!localStorage.getItem('pplWorkoutData')) {
    localStorage.setItem('pplWorkoutData', JSON.stringify(DEFAULT_WORKOUT_DATA));
    console.log('Initialized new workout data storage');
    return DEFAULT_WORKOUT_DATA;
  }
  return JSON.parse(localStorage.getItem('pplWorkoutData'));
}

/**
 * Load all workout data from localStorage
 * @returns {Object} The complete workout data object
 */
function loadWorkoutData() {
  const data = localStorage.getItem('pplWorkoutData');
  if (!data) {
    return initializeWorkoutData();
  }
  return JSON.parse(data);
}

/**
 * Save all workout data to localStorage
 * @param {Object} data - The complete workout data object
 */
function saveWorkoutData(data) {
  localStorage.setItem('pplWorkoutData', JSON.stringify(data));
}

/**
 * Load workout data for a specific day
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @param {string} day - The day identifier (e.g., 'push1', 'pull2')
 * @returns {Object|null} The workout day data or null if not found
 */
function loadWorkoutDay(phase, week, day) {
  const allData = loadWorkoutData();
  const phaseKey = `phase${phase}`;
  const weekKey = `week${week}`;
  
  if (!allData.progress[phaseKey] || 
      !allData.progress[phaseKey][weekKey] || 
      !allData.progress[phaseKey][weekKey][day]) {
    return null;
  }
  
  return allData.progress[phaseKey][weekKey][day];
}

/**
 * Save workout data for a specific day
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @param {string} day - The day identifier (e.g., 'push1', 'pull2')
 * @param {Object} dayData - The workout day data to save
 */
function saveWorkoutDay(phase, week, day, dayData) {
  const allData = loadWorkoutData();
  const phaseKey = `phase${phase}`;
  const weekKey = `week${week}`;
  
  // Create nested objects if they don't exist
  if (!allData.progress[phaseKey]) {
    allData.progress[phaseKey] = {};
  }
  
  if (!allData.progress[phaseKey][weekKey]) {
    allData.progress[phaseKey][weekKey] = {};
  }
  
  // Add date if not provided
  if (!dayData.date) {
    dayData.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  allData.progress[phaseKey][weekKey][day] = dayData;
  saveWorkoutData(allData);
  
  // Check for personal records
  if (dayData.exercises) {
    checkForPersonalRecords(dayData.exercises);
  }
  
  return dayData;
}

/**
 * Save a specific exercise set
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @param {string} day - The day identifier (e.g., 'push1', 'pull2')
 * @param {string} exerciseId - The exercise identifier
 * @param {number} setIndex - The set index (0-based)
 * @param {number|null} weight - The weight used for the set
 * @param {number|null} reps - The reps completed
 * @param {boolean} completed - Whether the set was completed
 */
function saveExerciseSet(phase, week, day, exerciseId, setIndex, weight, reps, completed) {
  const allData = loadWorkoutData();
  const phaseKey = `phase${phase}`;
  const weekKey = `week${week}`;
  
  // Create nested objects if they don't exist
  if (!allData.progress[phaseKey]) {
    allData.progress[phaseKey] = {};
  }
  
  if (!allData.progress[phaseKey][weekKey]) {
    allData.progress[phaseKey][weekKey] = {};
  }
  
  if (!allData.progress[phaseKey][weekKey][day]) {
    allData.progress[phaseKey][weekKey][day] = {
      date: new Date().toISOString().split('T')[0],
      exercises: {}
    };
  }
  
  if (!allData.progress[phaseKey][weekKey][day].exercises) {
    allData.progress[phaseKey][weekKey][day].exercises = {};
  }
  
  if (!allData.progress[phaseKey][weekKey][day].exercises[exerciseId]) {
    allData.progress[phaseKey][weekKey][day].exercises[exerciseId] = {
      sets: []
    };
  }
  
  // Ensure sets array is long enough
  while (allData.progress[phaseKey][weekKey][day].exercises[exerciseId].sets.length <= setIndex) {
    allData.progress[phaseKey][weekKey][day].exercises[exerciseId].sets.push({});
  }
  
  // Update set data
  allData.progress[phaseKey][weekKey][day].exercises[exerciseId].sets[setIndex] = {
    weight: weight !== null ? parseFloat(weight) : null,
    reps: reps !== null ? parseInt(reps) : null,
    completed: completed
  };
  
  saveWorkoutData(allData);
  
  // Check for personal record
  if (weight !== null && reps !== null) {
    checkPersonalRecord(exerciseId, parseFloat(weight), parseInt(reps));
  }
}

/**
 * Check if a set is a personal record and update if it is
 * @param {string} exerciseId - The exercise identifier
 * @param {number} weight - The weight used
 * @param {number} reps - The reps completed
 * @returns {boolean} Whether a new PR was set
 */
function checkPersonalRecord(exerciseId, weight, reps) {
  if (!weight || !reps) return false;
  
  const allData = loadWorkoutData();
  if (!allData.personalRecords) {
    allData.personalRecords = {};
  }
  
  const currentPR = allData.personalRecords[exerciseId];
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
    allData.personalRecords[exerciseId] = {
      weight: weight,
      reps: reps,
      date: new Date().toISOString().split('T')[0],
      volume: volume
    };
    
    saveWorkoutData(allData);
    return true;
  }
  
  return false;
}

/**
 * Check for personal records in a set of exercises
 * @param {Object} exercises - Object containing exercise data
 */
function checkForPersonalRecords(exercises) {
  for (const exerciseId in exercises) {
    const exercise = exercises[exerciseId];
    if (exercise.sets) {
      exercise.sets.forEach(set => {
        if (set.weight && set.reps) {
          checkPersonalRecord(exerciseId, set.weight, set.reps);
        }
      });
    }
  }
}

/**
 * Export workout data as a JSON file
 */
function exportWorkoutData() {
  const allData = loadWorkoutData();
  const dataStr = JSON.stringify(allData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportLink = document.createElement('a');
  exportLink.setAttribute('href', dataUri);
  exportLink.setAttribute('download', `ppl-workout-data-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(exportLink);
  
  exportLink.click();
  document.body.removeChild(exportLink);
  
  showFeedback('Data exported successfully!', 'success');
}

/**
 * Import workout data from a JSON file
 * @param {File} file - The JSON file to import
 */
function importWorkoutData(file) {
  const reader = new FileReader();
  
  reader.onload = function() {
    try {
      const data = JSON.parse(reader.result);
      
      // Validate data structure
      if (!data.progress || !data.settings) {
        showFeedback('Invalid workout data format', 'error');
        return;
      }
      
      // Save the imported data
      localStorage.setItem('pplWorkoutData', JSON.stringify(data));
      showFeedback('Workout data imported successfully!', 'success');
      
      // Reload the page to reflect changes
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch(e) {
      showFeedback(`Error importing data: ${e.message}`, 'error');
    }
  };
  
  reader.readAsText(file);
}

/**
 * Show feedback message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'warning', 'error')
 */
function showFeedback(message, type = 'success') {
  // Create feedback element if it doesn't exist
  let feedbackEl = document.getElementById('feedback-message');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'feedback-message';
    feedbackEl.className = 'feedback-message';
    document.querySelector('.container').prepend(feedbackEl);
  }
  
  // Set message and type
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback-message ${type}`;
  
  // Show the message
  feedbackEl.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    feedbackEl.style.display = 'none';
  }, 3000);
}

/**
 * Clear all workout data (with confirmation)
 * @returns {boolean} Whether the data was cleared
 */
function clearWorkoutData() {
  if (confirm('This will delete all your workout data. Are you sure?')) {
    localStorage.removeItem('pplWorkoutData');
    showFeedback('All workout data has been cleared', 'warning');
    
    // Reload the page to reset the UI
    setTimeout(() => {
      location.reload();
    }, 1500);
    
    return true;
  }
  return false;
}

/**
 * Update UI with saved workout data
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @param {string} day - The day identifier (e.g., 'push1', 'pull2')
 */
function updateUIWithSavedData(phase, week, day) {
  const dayData = loadWorkoutDay(phase, week, day);
  if (!dayData || !dayData.exercises) return;
  
  // For each exercise in the saved data
  for (const exerciseId in dayData.exercises) {
    const exerciseData = dayData.exercises[exerciseId];
    
    // For each set
    if (exerciseData.sets) {
      exerciseData.sets.forEach((set, index) => {
        const weightInput = document.querySelector(`.weight-input[data-exercise="${exerciseId}"][data-set="${index+1}"]`);
        const repInput = document.querySelector(`.rep-input[data-exercise="${exerciseId}"][data-set="${index+1}"]`);
        const completedCheckbox = document.querySelector(`.completed-checkbox[data-exercise="${exerciseId}"][data-set="${index+1}"]`);
        
        if (weightInput && set.weight !== null) weightInput.value = set.weight;
        if (repInput && set.reps !== null) repInput.value = set.reps;
        if (completedCheckbox) completedCheckbox.checked = set.completed;
        
        // Update set-row class if completed
        if (completedCheckbox && completedCheckbox.checked) {
          const setRow = completedCheckbox.closest('.set-row');
          if (setRow) setRow.classList.add('completed');
        }
        
        // Check if this is a PR
        if (set.weight && set.reps) {
          const isPR = checkPersonalRecord(exerciseId, set.weight, set.reps);
          if (isPR && weightInput) {
            weightInput.classList.add('personal-record');
          }
        }
      });
    }
    
    // Add notes if any
    if (exerciseData.notes) {
      const notesInput = document.querySelector(`.exercise-notes[data-exercise="${exerciseId}"] textarea`);
      if (notesInput) notesInput.value = exerciseData.notes;
    }
  }
}

/**
 * Get the current weight unit preference
 * @returns {string} The current weight unit ('kg' or 'lb')
 */
function getWeightUnit() {
  const data = loadWorkoutData();
  return data.settings?.units || 'lb';
}

/**
 * Set the weight unit preference
 * @param {string} unit - The weight unit to set ('kg' or 'lb')
 * @returns {Object} The updated workout data
 */
function setWeightUnit(unit) {
  if (unit !== 'kg' && unit !== 'lb') {
    throw new Error('Invalid weight unit. Must be "kg" or "lb"');
  }
  
  const data = loadWorkoutData();
  data.settings.units = unit;
  saveWorkoutData(data);
  
  showFeedback(`Weight unit changed to ${unit}`, 'success');
  return data;
}

// Export functions for use in other scripts
window.workoutStorage = {
  initialize: initializeWorkoutData,
  loadAll: loadWorkoutData,
  saveAll: saveWorkoutData,
  loadDay: loadWorkoutDay,
  saveDay: saveWorkoutDay,
  saveSet: saveExerciseSet,
  checkPR: checkPersonalRecord,
  exportData: exportWorkoutData,
  importData: importWorkoutData,
  clearData: clearWorkoutData,
  updateUI: updateUIWithSavedData,
  showFeedback: showFeedback,
  getWeightUnit: getWeightUnit,
  setWeightUnit: setWeightUnit
};