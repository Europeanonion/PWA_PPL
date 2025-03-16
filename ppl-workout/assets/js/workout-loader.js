/**
 * Workout Loader Module
 * Dynamically loads workout data from JSON files and creates workout day sections
 */

/**
 * Fetch workout data from a JSON file
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 * @returns {Promise<Object>} - The workout data
 */
async function fetchWorkoutData(phase, week) {
  try {
    const response = await fetch(`./dev/exercise-data/phase${phase}-week${week}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workout data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching workout data:', error);
    return null;
  }
}

/**
 * Create a workout day section
 * @param {string} dayId - The day ID (e.g., 'push1', 'pull1', 'legs1')
 * @param {Object} dayData - The workout day data
 * @returns {HTMLElement} - The workout day section
 */
function createWorkoutDaySection(dayId, dayData) {
  // Create the article element
  const article = document.createElement('article');
  article.className = 'workout-day';
  
  // Create the header
  const header = document.createElement('header');
  header.className = 'day-header';
  header.textContent = dayData.title;
  article.appendChild(header);
  
  // Create the progress indicator
  const progressIndicator = document.createElement('div');
  progressIndicator.className = 'progress-indicator';
  progressIndicator.innerHTML = `
    <div>
      <span>Workout Progress</span>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: 0%"></div>
      </div>
      <div class="progress-stats">
        <span>0/${dayData.exercises.length} exercises completed</span>
        <span>0%</span>
      </div>
    </div>
  `;
  article.appendChild(progressIndicator);
  
  // Create the exercise table
  const table = document.createElement('table');
  table.className = 'exercise-table';
  
  // Create the table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="table-header" style="width: 35%;">Exercise</th>
      <th class="table-header" style="width: 15%;">Warm-up</th>
      <th class="table-header" style="width: 15%;">Working</th>
      <th class="table-header" style="width: 15%;">Reps</th>
      <th class="table-header" style="width: 10%;">RPE</th>
      <th class="table-header" style="width: 10%;">Rest</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create the table body
  const tbody = document.createElement('tbody');
  
  // Add exercises
  dayData.exercises.forEach(exercise => {
    // Create exercise row
    const exerciseRow = document.createElement('tr');
    exerciseRow.className = 'exercise-row';
    
    // Exercise name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'exercise-name';
    nameCell.innerHTML = `
      <a href="${exercise.link}" class="exercise-link" target="_blank" rel="noopener">${exercise.name}</a>
      <span class="info-icon" onclick="toggleNotes('${exercise.id}-notes')">i</span>
    `;
    exerciseRow.appendChild(nameCell);
    
    // Warm-up sets cell
    const warmupCell = document.createElement('td');
    warmupCell.className = 'exercise-data';
    warmupCell.textContent = exercise.warmup_sets;
    exerciseRow.appendChild(warmupCell);
    
    // Working sets cell
    const workingCell = document.createElement('td');
    workingCell.className = 'exercise-data';
    workingCell.textContent = exercise.working_sets;
    exerciseRow.appendChild(workingCell);
    
    // Reps cell
    const repsCell = document.createElement('td');
    repsCell.className = 'exercise-data';
    repsCell.textContent = exercise.reps;
    exerciseRow.appendChild(repsCell);
    
    // RPE cell
    const rpeCell = document.createElement('td');
    rpeCell.className = 'exercise-data';
    rpeCell.textContent = exercise.rpe;
    exerciseRow.appendChild(rpeCell);
    
    // Rest cell
    const restCell = document.createElement('td');
    restCell.className = 'exercise-data';
    restCell.textContent = exercise.rest;
    exerciseRow.appendChild(restCell);
    
    // Add exercise row to table
    tbody.appendChild(exerciseRow);
    
    // Create notes row
    const notesRow = document.createElement('tr');
    notesRow.id = `${exercise.id}-notes`;
    notesRow.className = 'exercise-notes';
    
    // Notes cell
    const notesCell = document.createElement('td');
    notesCell.colSpan = 6;
    
    // Notes content
    let notesContent = `<strong>Notes:</strong> ${exercise.notes}`;
    
    // Add substitutions if available
    if (exercise.substitutions && exercise.substitutions.length > 0) {
      notesContent += `
        <br><br>
        <button class="sub-btn" onclick="toggleSubs('${exercise.id}-subs')">Show Substitutions</button>
        <div id="${exercise.id}-subs" class="substitutions">
          <strong>Substitution Options:</strong>
      `;
      
      exercise.substitutions.forEach((sub, index) => {
        notesContent += `<br>${index + 1}. ${sub}`;
      });
      
      notesContent += '</div>';
    }
    
    notesCell.innerHTML = notesContent;
    notesRow.appendChild(notesCell);
    
    // Add notes row to table
    tbody.appendChild(notesRow);
  });
  
  table.appendChild(tbody);
  article.appendChild(table);
  
  return article;
}

/**
 * Load workout data for a specific phase and week
 * @param {number} phase - The phase number
 * @param {number} week - The week number
 */
async function loadWorkoutData(phase, week) {
  console.log(`Loading workout data for Phase ${phase}, Week ${week}...`);
  
  // Get the week content container
  const weekContent = document.getElementById(`phase${phase}-week${week}`);
  if (!weekContent) {
    console.error(`Week content container not found for Phase ${phase}, Week ${week}`);
    return;
  }
  
  // Clear existing content
  weekContent.innerHTML = '';
  
  // Fetch workout data
  const workoutData = await fetchWorkoutData(phase, week);
  if (!workoutData) {
    console.error(`Failed to load workout data for Phase ${phase}, Week ${week}`);
    weekContent.innerHTML = `<p style="padding: 20px; text-align: center;">Failed to load workout data for Phase ${phase}, Week ${week}. Please try again later.</p>`;
    return;
  }
  
  // Create workout day sections
  for (const dayId in workoutData.days) {
    const dayData = workoutData.days[dayId];
    const daySection = createWorkoutDaySection(dayId, dayData);
    weekContent.appendChild(daySection);
  }
  
  // Generate exercise inputs
  if (window.generateExerciseInputs) {
    setTimeout(window.generateExerciseInputs, 100);
  }
  
  // Update progress indicators
  if (window.updateWorkoutProgress) {
    setTimeout(window.updateWorkoutProgress, 200);
  }
  
  console.log(`Workout data loaded for Phase ${phase}, Week ${week}`);
}

/**
 * Initialize workout loader
 */
function initWorkoutLoader() {
  console.log('Initializing workout loader...');
  
  // Load initial workout data (Phase 1, Week 1)
  loadWorkoutData(1, 1);
  
  // Add event listeners for phase and week changes
  document.querySelectorAll('.phase-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const phaseId = this.getAttribute('onclick').match(/showPhase\('(.+?)'\)/)[1];
      const phase = parseInt(phaseId.replace('phase', ''));
      
      // Wait for the phase change to complete
      setTimeout(() => {
        // Find the active week in this phase
        const activeWeek = document.querySelector(`#${phaseId} .week-content.active`);
        if (activeWeek) {
          const week = parseInt(activeWeek.id.split('-')[1].replace('week', ''));
          loadWorkoutData(phase, week);
        }
      }, 100);
    });
  });
  
  document.querySelectorAll('.week-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const onclick = this.getAttribute('onclick');
      const match = onclick.match(/showWeek\('(.+?)', '(.+?)'\)/);
      if (match) {
        const phaseId = match[1];
        const weekId = match[2];
        const phase = parseInt(phaseId.replace('phase', ''));
        const week = parseInt(weekId.replace('week', ''));
        
        // Wait for the week change to complete
        setTimeout(() => {
          loadWorkoutData(phase, week);
        }, 100);
      }
    });
  });
  
  console.log('Workout loader initialized');
}

// Make functions available globally
window.workoutLoader = {
  init: initWorkoutLoader,
  loadData: loadWorkoutData
};

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize workout loader
  initWorkoutLoader();
});