/**
 * Workout Loader Module
 * Handles loading and displaying workout data
 */

/**
 * Fetch workout data for a specific phase and week
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @returns {Promise<Object>} The workout data
 */
async function fetchWorkoutData(phase, week) {
  try {
    // Use relative path from the current location to the dev directory
    const response = await fetch(`/PWA_PPL/dev/exercise-data/phase${phase}-week${week}.json`);
    if (!response.ok) {
      console.warn(`Failed to fetch workout data: ${response.status} ${response.statusText}`);
      // Try alternative path as a fallback
      const altResponse = await fetch(`/ppl-workout/dev/exercise-data/phase${phase}-week${week}.json`);
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch workout data with all path strategies`);
      }
      return await altResponse.json();
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching workout data:', error);
    return null;
  }
}

/**
 * Create a workout day section
 * @param {string} dayId - The day ID (e.g., 'push1')
 * @param {Object} dayData - The day data
 * @returns {HTMLElement} The workout day section
 */
function createWorkoutDaySection(dayId, dayData) {
  const section = document.createElement('section');
  section.className = 'workout-day';
  section.id = dayId;
  
  // Create day header
  const header = document.createElement('h3');
  header.className = 'day-header';
  header.textContent = dayData.title;
  section.appendChild(header);
  
  // Create exercise table
  const table = document.createElement('table');
  table.className = 'exercise-table';
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Exercise', 'Sets', 'Working Sets', 'Reps', 'RPE', 'Rest'];
  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Add exercises
  if (dayData.exercises && dayData.exercises.length > 0) {
    dayData.exercises.forEach(exercise => {
      // Create exercise row
      const exerciseRow = document.createElement('tr');
      exerciseRow.className = 'exercise-row';
      exerciseRow.id = `${exercise.id}-row`;
      
      // Exercise name cell with info icon
      const nameCell = document.createElement('td');
      nameCell.className = 'exercise-name';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = exercise.name;
      nameCell.appendChild(nameSpan);
      
      const infoIcon = document.createElement('span');
      infoIcon.className = 'info-icon';
      infoIcon.innerHTML = 'ⓘ';
      infoIcon.setAttribute('onclick', `toggleNotes('${exercise.id}-notes')`);
      nameCell.appendChild(infoIcon);
      
      // Sets cell
      const setsCell = document.createElement('td');
      setsCell.className = 'exercise-data';
      setsCell.textContent = exercise.warmup_sets;
      
      // Working sets cell
      const workingSetsCell = document.createElement('td');
      workingSetsCell.className = 'exercise-data';
      workingSetsCell.textContent = exercise.working_sets;
      
      // Reps cell
      const repsCell = document.createElement('td');
      repsCell.className = 'exercise-data';
      repsCell.textContent = exercise.reps;
      
      // RPE cell
      const rpeCell = document.createElement('td');
      rpeCell.className = 'exercise-data';
      rpeCell.textContent = exercise.rpe;
      
      // Rest cell
      const restCell = document.createElement('td');
      restCell.className = 'exercise-data';
      restCell.textContent = exercise.rest;
      
      // Add cells to row
      exerciseRow.appendChild(nameCell);
      exerciseRow.appendChild(setsCell);
      exerciseRow.appendChild(workingSetsCell);
      exerciseRow.appendChild(repsCell);
      exerciseRow.appendChild(rpeCell);
      exerciseRow.appendChild(restCell);
      
      // Add row to table
      tbody.appendChild(exerciseRow);
      
      // Create notes row
      const notesRow = document.createElement('tr');
      notesRow.className = 'notes-row';
      notesRow.id = `${exercise.id}-notes`;
      notesRow.style.display = 'none';
      
      const notesCell = document.createElement('td');
      notesCell.colSpan = 6;
      
      // Notes content
      const notesContent = document.createElement('div');
      notesContent.className = 'notes-content';
      
      // Notes text
      const notesText = document.createElement('p');
      notesText.textContent = exercise.notes;
      notesContent.appendChild(notesText);
      
      // Video link
      if (exercise.link) {
        const videoLink = document.createElement('a');
        videoLink.href = exercise.link;
        videoLink.textContent = 'Watch Video';
        videoLink.target = '_blank';
        videoLink.rel = 'noopener';
        notesContent.appendChild(videoLink);
      }
      
      // Substitutions
      if (exercise.substitutions && exercise.substitutions.length > 0) {
        const subsTitle = document.createElement('p');
        subsTitle.className = 'subs-title';
        subsTitle.textContent = 'Substitutions:';
        subsTitle.innerHTML += ` <span class="toggle-subs" onclick="toggleSubs('${exercise.id}-subs')">Show</span>`;
        notesContent.appendChild(subsTitle);
        
        const subsList = document.createElement('ul');
        subsList.className = 'subs-list';
        subsList.id = `${exercise.id}-subs`;
        subsList.style.display = 'none';
        
        exercise.substitutions.forEach(sub => {
          const subItem = document.createElement('li');
          subItem.textContent = sub;
          subsList.appendChild(subItem);
        });
        
        notesContent.appendChild(subsList);
      }
      
      notesCell.appendChild(notesContent);
      notesRow.appendChild(notesCell);
      
      // Add notes row to table
      tbody.appendChild(notesRow);
    });
  }
  
  table.appendChild(tbody);
  section.appendChild(table);
  
  return section;
}

/**
 * Load workout data for a specific phase and week
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 */
async function loadWorkoutData(phase, week) {
  // Get the content container - Fix: match the actual DOM structure
  const contentContainer = document.querySelector(`#phase${phase}-week${week}`);
  if (!contentContainer) {
    console.error(`Content container not found for Phase ${phase}, Week ${week}`);
    return;
  }
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Fetch workout data
  const workoutData = await fetchWorkoutData(phase, week);
  if (!workoutData) {
    console.error(`Failed to load workout data for Phase ${phase}, Week ${week}`);
    contentContainer.innerHTML = '<p class="error-message">Failed to load workout data. Please try again later.</p>';
    return;
  }
  
  // Create workout day sections
  if (workoutData.days) {
    Object.entries(workoutData.days).forEach(([dayId, dayData]) => {
      const daySection = createWorkoutDaySection(dayId, dayData);
      contentContainer.appendChild(daySection);
    });
  }
  
  // Generate exercise inputs after a delay
  if (window.generateExerciseInputs) {
    setTimeout(window.generateExerciseInputs, 300);
  }
  
  // Update progress indicators after an additional delay
  if (window.updateWorkoutProgress) {
    setTimeout(window.updateWorkoutProgress, 400);
  }
  
  console.log(`Workout data loaded for Phase ${phase}, Week ${week}`);
}

/**
 * Check if the workout loader is available
 * @returns {boolean} Whether the workout loader is available
 */
function checkWorkoutLoader() {
  if (window.loadWorkoutData) {
    return true;
  }
  
  // Make functions globally available
  window.loadWorkoutData = loadWorkoutData;
  window.fetchWorkoutData = fetchWorkoutData;
  window.createWorkoutDaySection = createWorkoutDaySection;
  
  console.log('WorkoutLoader initialized');
  return true;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, checking for workoutLoader...');
  
  // First attempt with longer delays
  setTimeout(() => {
    if (!checkWorkoutLoader()) {
      console.log('WorkoutLoader not available yet, will retry...');
      
      setTimeout(() => {
        if (!checkWorkoutLoader()) {
          console.log('WorkoutLoader still not available, final retry...');
          
          setTimeout(() => {
            if (!checkWorkoutLoader()) {
              console.error('WorkoutLoader not available after multiple attempts');
            }
          }, 2000);
        }
      }, 1500);
    }
  }, 500);
});