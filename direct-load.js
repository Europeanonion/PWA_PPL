/**
 * Direct Load Script
 * This script directly loads workout data for Phase 1, Week 1
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Direct load script running...');
  
  // Function to fetch workout data
  async function fetchWorkoutData(phase, week) {
    try {
      // Try multiple paths to accommodate different environments
      const paths = [
        `dev/exercise-data/phase${phase}-week${week}.json`,
        `./dev/exercise-data/phase${phase}-week${week}.json`,
        `/dev/exercise-data/phase${phase}-week${week}.json`,
        `../dev/exercise-data/phase${phase}-week${week}.json`,
        `/ppl-workout/dev/exercise-data/phase${phase}-week${week}.json`,
        `ppl-workout/dev/exercise-data/phase${phase}-week${week}.json`,
        `/workspaces/exceljson/dev/exercise-data/phase${phase}-week${week}.json`
      ];
      
      console.log(`Direct load: Fetching data for Phase ${phase}, Week ${week}`);
      
      // Try each path in sequence
      for (const path of paths) {
        try {
          console.log(`Direct load: Trying path: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            console.log(`Direct load: Successfully loaded data from: ${path}`);
            return await response.json();
          }
        } catch (e) {
          console.warn(`Direct load: Path ${path} failed: ${e.message}`);
        }
      }
      
      throw new Error(`Direct load: Failed to fetch workout data for Phase ${phase}, Week ${week}`);
    } catch (error) {
      console.error('Direct load: Error fetching workout data:', error);
      return null;
    }
  }
  
  // Function to create workout day section
  function createWorkoutDaySection(dayId, dayData) {
    console.log(`Direct load: Creating section for ${dayId}`);
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
    
    // Add progress tracking
    const progressSection = document.createElement('div');
    progressSection.className = 'progress-section';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    
    const progressBarFill = document.createElement('div');
    progressBarFill.className = 'progress-bar-fill';
    progressBarFill.style.width = '0%';
    
    progressBar.appendChild(progressBarFill);
    progressSection.appendChild(progressBar);
    
    const progressStats = document.createElement('div');
    progressStats.className = 'progress-stats';
    progressStats.innerHTML = '<span>0/0 exercises completed</span><span>0%</span>';
    
    progressSection.appendChild(progressStats);
    section.appendChild(progressSection);
    
    return section;
  }
  
  // Function to load workout data
  async function loadWorkoutData(phase, week) {
    console.log(`Direct load: Loading data for Phase ${phase}, Week ${week}`);
    
    // Get the content container
    const contentContainer = document.querySelector(`#phase${phase}-week${week}`);
    if (!contentContainer) {
      console.error(`Direct load: Content container not found for Phase ${phase}, Week ${week}`);
      return;
    }
    
    // Check if data is already loaded
    if (contentContainer.querySelector('.workout-day')) {
      console.log(`Direct load: Data already loaded for Phase ${phase}, Week ${week}`);
      return;
    }
    
    // Show loading indicator
    contentContainer.innerHTML = '<div class="loading-indicator">Loading workout data...</div>';
    
    // Fetch workout data
    const workoutData = await fetchWorkoutData(phase, week);
    if (!workoutData) {
      console.error(`Direct load: Failed to load workout data for Phase ${phase}, Week ${week}`);
      contentContainer.innerHTML = '<p class="error-message">Failed to load workout data. Please try again later.</p>';
      return;
    }
    
    // Clear loading indicator
    contentContainer.innerHTML = '';
    
    // Create workout day sections
    if (workoutData.days) {
      Object.entries(workoutData.days).forEach(([dayId, dayData]) => {
        const daySection = createWorkoutDaySection(dayId, dayData);
        contentContainer.appendChild(daySection);
      });
    }
    
    console.log(`Direct load: Workout data loaded for Phase ${phase}, Week ${week}`);
  }
  
  // Load initial data for Phase 1, Week 1 after a delay
  setTimeout(() => {
    console.log('Direct load: Loading initial data for Phase 1, Week 1');
    loadWorkoutData(1, 1);
  }, 2000);
});