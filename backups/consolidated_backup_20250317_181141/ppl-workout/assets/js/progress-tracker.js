/**
 * Progress Tracker Module
 * Handles workout progress tracking and visualization
 */

// Initialize the progress tracker
function initProgressTracker() {
  console.log('Initializing progress tracker...');
  
  // Update progress on page load
  updateAllWorkoutProgress();
  
  // Add event listeners to checkboxes to update progress when changed
  document.querySelectorAll('.completed-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Update the progress for the current workout day
      const workoutDay = this.closest('.workout-day');
      if (workoutDay) {
        updateWorkoutDayProgress(workoutDay);
      }
    });
  });
  
  // Add event listeners for phase and week changes
  document.querySelectorAll('.phase-btn, .week-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Wait for the content to update
      setTimeout(updateAllWorkoutProgress, 100);
    });
  });
}

/**
 * Update progress for all visible workout days
 */
function updateAllWorkoutProgress() {
  // Get all active workout days
  const activeWorkoutDays = document.querySelectorAll('.week-content.active .workout-day');
  
  activeWorkoutDays.forEach(day => {
    updateWorkoutDayProgress(day);
  });
}

/**
 * Update progress for a specific workout day
 * @param {HTMLElement} workoutDay - The workout day element
 */
function updateWorkoutDayProgress(workoutDay) {
  // Get all exercises in this workout day
  const exerciseRows = workoutDay.querySelectorAll('.exercise-row');
  const totalExercises = new Set();
  const completedExercises = new Set();
  
  // Process each exercise row
  exerciseRows.forEach(row => {
    const exerciseName = row.querySelector('.exercise-name');
    if (!exerciseName) return;
    
    // Get exercise ID from the info icon's onclick attribute
    const infoIcon = exerciseName.querySelector('.info-icon');
    if (!infoIcon) return;
    
    const onclickAttr = infoIcon.getAttribute('onclick');
    if (!onclickAttr) return;
    
    // Extract exercise ID from toggleNotes('exercise-id-notes')
    const match = onclickAttr.match(/toggleNotes\('(.+?)-notes'\)/);
    if (!match || !match[1]) return;
    
    const exerciseId = match[1];
    totalExercises.add(exerciseId);
    
    // Check if any checkbox for this exercise is checked
    const checkboxes = row.querySelectorAll(`.completed-checkbox[data-exercise="${exerciseId}"]`);
    let isCompleted = false;
    
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        isCompleted = true;
      }
    });
    
    if (isCompleted) {
      completedExercises.add(exerciseId);
      
      // Add visual indicator to the exercise row
      row.classList.add('exercise-completed');
    } else {
      row.classList.remove('exercise-completed');
    }
  });
  
  // Calculate progress percentage
  const totalCount = totalExercises.size;
  const completedCount = completedExercises.size;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Update progress bar
  const progressBar = workoutDay.querySelector('.progress-bar-fill');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
    
    // Add color based on progress
    if (progressPercent === 100) {
      progressBar.style.backgroundColor = 'var(--success-color)';
    } else if (progressPercent > 50) {
      progressBar.style.backgroundColor = 'var(--brand-gold)';
    } else if (progressPercent > 0) {
      progressBar.style.backgroundColor = 'var(--warning-color)';
    } else {
      progressBar.style.backgroundColor = 'var(--neutral-400)';
    }
  }
  
  // Update progress stats
  const progressStats = workoutDay.querySelector('.progress-stats');
  if (progressStats) {
    progressStats.innerHTML = `
      <span>${completedCount}/${totalCount} exercises completed</span>
      <span>${progressPercent}%</span>
    `;
  }
  
  // If workout is complete, add a visual indicator to the day header
  const dayHeader = workoutDay.querySelector('.day-header');
  if (dayHeader) {
    if (progressPercent === 100) {
      if (!dayHeader.querySelector('.completion-badge')) {
        const badge = document.createElement('span');
        badge.className = 'completion-badge';
        badge.innerHTML = '✓';
        badge.title = 'Workout Complete';
        dayHeader.appendChild(badge);
      }
    } else {
      const badge = dayHeader.querySelector('.completion-badge');
      if (badge) {
        badge.remove();
      }
    }
  }
  
  // Save progress to localStorage if available
  saveProgressToLocalStorage(workoutDay, completedExercises);
}

/**
 * Save progress to localStorage
 * @param {HTMLElement} workoutDay - The workout day element
 * @param {Set} completedExercises - Set of completed exercise IDs
 */
function saveProgressToLocalStorage(workoutDay, completedExercises) {
  if (!window.workoutStorage) return;
  
  // Get current phase and week
  const phaseContent = workoutDay.closest('.phase-content');
  const weekContent = workoutDay.closest('.week-content');
  
  if (!phaseContent || !weekContent) return;
  
  const phaseId = phaseContent.id;
  const weekId = weekContent.id.split('-')[1];
  const dayHeader = workoutDay.querySelector('.day-header').textContent.toLowerCase().replace(/\s+/g, '').replace('#', '');
  
  const phaseNum = phaseId.replace('phase', '');
  const weekNum = weekId.replace('week', '');
  
  // Get the current workout data
  const workoutData = window.workoutStorage.loadAll();
  
  // Update the completion status
  if (!workoutData.progress) workoutData.progress = {};
  if (!workoutData.progress[phaseId]) workoutData.progress[phaseId] = {};
  if (!workoutData.progress[phaseId][weekId]) workoutData.progress[phaseId][weekId] = {};
  if (!workoutData.progress[phaseId][weekId][dayHeader]) {
    workoutData.progress[phaseId][weekId][dayHeader] = {
      date: new Date().toISOString().split('T')[0],
      exercises: {}
    };
  }
  
  // Update completion status for each exercise
  const exercises = workoutDay.querySelectorAll('.exercise-row');
  exercises.forEach(row => {
    const exerciseName = row.querySelector('.exercise-name');
    if (!exerciseName) return;
    
    const infoIcon = exerciseName.querySelector('.info-icon');
    if (!infoIcon) return;
    
    const onclickAttr = infoIcon.getAttribute('onclick');
    if (!onclickAttr) return;
    
    const match = onclickAttr.match(/toggleNotes\('(.+?)-notes'\)/);
    if (!match || !match[1]) return;
    
    const exerciseId = match[1];
    const isCompleted = completedExercises.has(exerciseId);
    
    // Update the exercise completion status
    if (!workoutData.progress[phaseId][weekId][dayHeader].exercises[exerciseId]) {
      workoutData.progress[phaseId][weekId][dayHeader].exercises[exerciseId] = {
        completed: isCompleted
      };
    } else {
      workoutData.progress[phaseId][weekId][dayHeader].exercises[exerciseId].completed = isCompleted;
    }
  });
  
  // Save the updated data
  window.workoutStorage.saveAll(workoutData);
}

/**
 * Load progress from localStorage and update UI
 */
function loadProgressFromLocalStorage() {
  if (!window.workoutStorage) return;
  
  // Get the current workout data
  const workoutData = window.workoutStorage.loadAll();
  if (!workoutData.progress) return;
  
  // Get all workout days
  const workoutDays = document.querySelectorAll('.workout-day');
  
  workoutDays.forEach(day => {
    // Get phase, week, and day info
    const phaseContent = day.closest('.phase-content');
    const weekContent = day.closest('.week-content');
    
    if (!phaseContent || !weekContent) return;
    
    const phaseId = phaseContent.id;
    const weekId = weekContent.id.split('-')[1];
    const dayHeader = day.querySelector('.day-header').textContent.toLowerCase().replace(/\s+/g, '').replace('#', '');
    
    // Check if we have saved progress for this day
    if (workoutData.progress[phaseId] && 
        workoutData.progress[phaseId][weekId] && 
        workoutData.progress[phaseId][weekId][dayHeader]) {
      
      const dayData = workoutData.progress[phaseId][weekId][dayHeader];
      
      // Update checkboxes based on saved data
      if (dayData.exercises) {
        for (const exerciseId in dayData.exercises) {
          const exerciseData = dayData.exercises[exerciseId];
          
          if (exerciseData.completed) {
            // Find the exercise row
            const exerciseRows = day.querySelectorAll('.exercise-row');
            
            exerciseRows.forEach(row => {
              const infoIcon = row.querySelector('.info-icon');
              if (!infoIcon) return;
              
              const onclickAttr = infoIcon.getAttribute('onclick');
              if (!onclickAttr) return;
              
              const match = onclickAttr.match(/toggleNotes\('(.+?)-notes'\)/);
              if (!match || !match[1]) return;
              
              if (match[1] === exerciseId) {
                // Mark the exercise as completed
                row.classList.add('exercise-completed');
                
                // Check all checkboxes for this exercise
                const checkboxes = row.querySelectorAll(`.completed-checkbox[data-exercise="${exerciseId}"]`);
                checkboxes.forEach(checkbox => {
                  checkbox.checked = true;
                  const setRow = checkbox.closest('.set-row');
                  if (setRow) {
                    setRow.classList.add('completed');
                  }
                });
              }
            });
          }
        }
      }
      
      // Update the progress display
      updateWorkoutDayProgress(day);
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize progress tracker
  initProgressTracker();
  
  // Load saved progress
  loadProgressFromLocalStorage();
});

// Add CSS for completion indicators
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .exercise-completed {
      position: relative;
    }
    
    .exercise-completed::after {
      content: "✓";
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      color: var(--success-color);
      font-size: 18px;
      font-weight: bold;
    }
    
    .completion-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background-color: var(--success-color);
      color: white;
      border-radius: 50%;
      margin-left: 10px;
      font-size: 14px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
});