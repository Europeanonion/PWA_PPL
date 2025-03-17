/**
 * Load All Phases Script
 * This script loads workout data for all phases and weeks
 */

// Define the correct number of weeks per phase
const weeksPerPhase = {
  1: 6, // Phase 1: weeks 1-6
  2: 4, // Phase 2: weeks 1-4
  3: 3  // Phase 3: weeks 1-3
};

// Function to check if workoutLoader is available
function checkWorkoutLoader() {
  if (window.workoutLoader) {
    console.log('WorkoutLoader found, loading all phases and weeks...');
    
    // Load data for all phases
    Object.keys(weeksPerPhase).forEach(phase => {
      const phaseNum = parseInt(phase);
      
      // Load data for all weeks in this phase
      for (let week = 1; week <= weeksPerPhase[phase]; week++) {
        console.log(`Pre-loading Phase ${phaseNum}, Week ${week} data...`);
        try {
          // Use the loadData method if available, otherwise fall back to loadWorkoutData
          if (typeof window.workoutLoader.loadData === 'function') {
            window.workoutLoader.loadData(phaseNum, week);
          } else if (typeof window.loadWorkoutData === 'function') {
            window.loadWorkoutData(phaseNum, week);
          } else {
            console.warn(`No method available to load workout data for Phase ${phaseNum}, Week ${week}`);
          }
        } catch (error) {
          console.error(`Error loading Phase ${phaseNum}, Week ${week}:`, error);
        }
      }
    });
    
    console.log('All phases and weeks pre-loaded');
    return true;
  }
  
  return false;
}

// Try to load data when the DOM is loaded with increased delays
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking for workoutLoader...');
  
  // First attempt with longer delay
  setTimeout(() => {
    if (!checkWorkoutLoader()) {
      console.log('WorkoutLoader not available yet, will retry...');
      
      // Retry after a longer delay
      setTimeout(() => {
        if (!checkWorkoutLoader()) {
          console.log('WorkoutLoader still not available, will retry once more...');
          
          // Final retry with even longer delay
          setTimeout(() => {
            if (!checkWorkoutLoader()) {
              console.error('WorkoutLoader not available after multiple attempts');
            }
          }, 2000);
        }
      }, 1500);
    }
  }, 1000);
});