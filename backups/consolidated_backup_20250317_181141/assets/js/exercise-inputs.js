/**
 * Exercise Inputs Generator
 * Dynamically creates weight tracking inputs for exercises
 */

/**
 * Get the current weight unit preference (kg or lb)
 * @returns {string} The current weight unit (kg or lb)
 */
function getWeightUnit() {
  if (window.workoutStorage) {
    const data = window.workoutStorage.loadAll();
    return data.settings?.units || 'lb';
  }
  return 'lb'; // Default to lb if storage not available
}

/**
 * Set the weight unit preference (kg or lb)
 * @param {string} unit - The weight unit to set (kg or lb)
 */
function setWeightUnit(unit) {
  if (window.workoutStorage) {
    const data = window.workoutStorage.loadAll();
    data.settings.units = unit;
    window.workoutStorage.saveAll(data);
    
    // Update all weight input placeholders
    updateWeightPlaceholders(unit);
    
    // Show feedback
    window.workoutStorage.showFeedback(`Weight unit changed to ${unit}`, 'success');
  }
}

/**
 * Update all weight input placeholders based on the selected unit
 * @param {string} unit - The weight unit (kg or lb)
 */
function updateWeightPlaceholders(unit) {
  document.querySelectorAll('.weight-input').forEach(input => {
    input.placeholder = unit;
  });
}

/**
 * Create the weight unit selector UI
 * @returns {HTMLElement} The weight unit selector element
 */
function createWeightUnitSelector() {
  const currentUnit = getWeightUnit();
  
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'weight-unit-selector';
  
  const label = document.createElement('label');
  label.textContent = 'Weight Unit: ';
  selectorContainer.appendChild(label);
  
  const kgLabel = document.createElement('label');
  kgLabel.className = 'unit-label';
  kgLabel.innerHTML = '<input type="radio" name="weight-unit" value="kg"> kg';
  selectorContainer.appendChild(kgLabel);
  
  const lbLabel = document.createElement('label');
  lbLabel.className = 'unit-label';
  lbLabel.innerHTML = '<input type="radio" name="weight-unit" value="lb"> lb';
  selectorContainer.appendChild(lbLabel);
  
  // Set the current unit
  const radioInput = selectorContainer.querySelector(`input[value="${currentUnit}"]`);
  if (radioInput) radioInput.checked = true;
  
  // Add event listeners
  selectorContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
      setWeightUnit(this.value);
    });
  });
  
  return selectorContainer;
}

/**
 * Save exercise set data to localStorage
 * This function is called when a weight input or checkbox changes
 * @param {Event} event - The change event
 */
function handleExerciseSetChange(event) {
  const element = event.target;
  const exerciseId = element.dataset.exercise;
  const setIndex = parseInt(element.dataset.set) - 1;
  const currentPhase = document.querySelector('.phase-content.active').id.replace('phase', '');
  const currentWeek = document.querySelector(`#phase${currentPhase} .week-content.active`).id.split('-')[1].replace('week', '');
  const dayElement = element.closest('.workout-day');
  const dayHeader = dayElement.querySelector('.day-header').textContent.toLowerCase().replace(/\s+/g, '').replace('#', '');
  
  // Get values
  let weight = null;
  let completed = false;
  
  if (element.classList.contains('weight-input')) {
    weight = element.value ? parseFloat(element.value) : null;
    const checkbox = element.parentNode.querySelector('.completed-checkbox');
    completed = checkbox ? checkbox.checked : false;
  } else if (element.classList.contains('completed-checkbox')) {
    const weightInput = element.parentNode.querySelector('.weight-input');
    weight = weightInput && weightInput.value ? parseFloat(weightInput.value) : null;
    completed = element.checked;
  }
  
  // Save to localStorage using the workoutStorage module
  if (exerciseId && setIndex >= 0 && window.workoutStorage) {
    window.workoutStorage.saveSet(
      currentPhase,
      currentWeek,
      dayHeader,
      exerciseId,
      setIndex,
      weight,
      null, // reps - we're not tracking this separately for now
      completed
    );
  }
}

/**
 * Generate weight tracking inputs for all exercises
 * This function finds all exercise rows and adds weight tracking inputs
 * based on the number of sets for each exercise
 */
function generateExerciseInputs() {
  console.log('Generating exercise inputs...');
  
  // Get the current weight unit
  const weightUnit = getWeightUnit();
  
  // Get all exercise rows
  const exerciseRows = document.querySelectorAll('.exercise-row');
  
  exerciseRows.forEach(row => {
    // Get exercise name element
    const nameElement = row.querySelector('.exercise-name');
    if (!nameElement) return;
    
    // Extract exercise ID from the info icon's onclick attribute
    const infoIcon = nameElement.querySelector('.info-icon');
    if (!infoIcon) return;
    
    const onclickAttr = infoIcon.getAttribute('onclick');
    if (!onclickAttr) return;
    
    // Extract exercise ID from toggleNotes('exercise-id-notes')
    const match = onclickAttr.match(/toggleNotes\('(.+?)-notes'\)/);
    if (!match || !match[1]) return;
    
    const exerciseId = match[1];
    
    // Get the working sets cell
    const workingSetsCell = row.querySelector('td.exercise-data:nth-child(3)');
    if (!workingSetsCell) return;
    
    // Get the number of sets from the cell content
    // If it's already a set-inputs container, skip this row
    if (workingSetsCell.querySelector('.set-inputs')) return;
    
    // Parse the number of sets
    let numSets = parseInt(workingSetsCell.textContent.trim());
    if (isNaN(numSets)) numSets = 1; // Default to 1 set if parsing fails
    
    // Create set inputs container
    const setInputsContainer = document.createElement('div');
    setInputsContainer.className = 'set-inputs';
    
    // Create input rows for each set
    for (let i = 1; i <= numSets; i++) {
      const setRow = document.createElement('div');
      setRow.className = 'set-row';
      
      // Create weight input
      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.className = 'weight-input';
      weightInput.dataset.exercise = exerciseId;
      weightInput.dataset.set = i;
      weightInput.placeholder = weightUnit; // Use the current weight unit
      weightInput.addEventListener('change', handleExerciseSetChange);
      weightInput.addEventListener('blur', handleExerciseSetChange);
      
      // Create completed checkbox
      const completedCheckbox = document.createElement('input');
      completedCheckbox.type = 'checkbox';
      completedCheckbox.className = 'completed-checkbox';
      completedCheckbox.dataset.exercise = exerciseId;
      completedCheckbox.dataset.set = i;
      completedCheckbox.addEventListener('change', function(event) {
        if (this.checked) {
          this.closest('.set-row').classList.add('completed');
        } else {
          this.closest('.set-row').classList.remove('completed');
        }
        handleExerciseSetChange(event);
      });
      
      // Add inputs to row
      setRow.appendChild(weightInput);
      setRow.appendChild(completedCheckbox);
      
      // Add row to container
      setInputsContainer.appendChild(setRow);
    }
    
    // Replace the content of the working sets cell
    workingSetsCell.textContent = '';
    workingSetsCell.appendChild(setInputsContainer);
  });
  
  console.log('Exercise inputs generation complete');
}

/**
 * Add the weight unit selector to the UI
 */
function addWeightUnitSelector() {
  const dataManagement = document.querySelector('.data-management');
  if (!dataManagement) return;
  
  const unitSelector = createWeightUnitSelector();
  dataManagement.appendChild(unitSelector);
}

/**
 * Initialize the exercise inputs when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing exercise inputs...');
  
  // Add weight unit selector to the UI
  addWeightUnitSelector();
  
  // Generate inputs for the initial view
  setTimeout(generateExerciseInputs, 200); // Increased delay to ensure DOM is fully loaded
  
  // Add event listeners for phase and week changes to update inputs
  document.querySelectorAll('.phase-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Wait for the phase change to complete with increased delay
      setTimeout(generateExerciseInputs, 200);
    });
  });
  
  document.querySelectorAll('.week-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Wait for the week change to complete with increased delay
      setTimeout(generateExerciseInputs, 200);
    });
  });
});