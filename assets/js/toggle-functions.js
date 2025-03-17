/**
 * Toggle Notes Function
 * Safely toggles the visibility of notes sections
 */

/**
 * Toggle the visibility of notes
 * @param {string} id - The ID of the element to toggle
 */
function toggleNotes(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID ${id} not found`);
    return;
  }
  
  // Check if style property exists (it should, but just to be safe)
  if (element.style) {
    if (element.style.display === "table-row") {
      element.style.display = "none";
      element.classList.remove("visible");
    } else {
      element.style.display = "table-row";
      element.classList.add("visible");
    }
  }
}

/**
 * Toggle the visibility of substitutions
 * @param {string} id - The ID of the element to toggle
 */
function toggleSubs(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with ID ${id} not found`);
    return;
  }
  
  // Check if style property exists (it should, but just to be safe)
  if (element.style) {
    if (element.style.display === "block") {
      element.style.display = "none";
      element.classList.remove("visible");
    } else {
      element.style.display = "block";
      element.classList.add("visible");
    }
  }
}