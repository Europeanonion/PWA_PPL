/**
 * Network Status Module
 * Handles network status detection and UI updates
 */

// Initialize network status indicators
function initNetworkStatus() {
  // Create status indicator element if it doesn't exist
  let statusIndicator = document.getElementById('network-status');
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'network-status';
    statusIndicator.className = 'network-status';
    document.body.appendChild(statusIndicator);
    
    // Add styles if not already in CSS
    addNetworkStatusStyles();
  }
  
  // Set initial status
  updateNetworkStatus();
  
  // Add event listeners for online/offline events
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
}

/**
 * Update the network status indicator based on current connection status
 */
function updateNetworkStatus() {
  const statusIndicator = document.getElementById('network-status');
  if (!statusIndicator) return;
  
  const isOnline = navigator.onLine;
  
  if (isOnline) {
    statusIndicator.className = 'network-status online';
    statusIndicator.innerHTML = '<span class="status-icon">✓</span> Online';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusIndicator.classList.add('hidden');
    }, 3000);
  } else {
    statusIndicator.className = 'network-status offline';
    statusIndicator.innerHTML = '<span class="status-icon">!</span> Offline Mode';
    
    // Show offline message
    showFeedback('You are offline. Your changes will be saved locally.', 'warning');
    
    // Keep visible when offline
    statusIndicator.classList.remove('hidden');
  }
}

/**
 * Show a toast notification for network status changes
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'warning', 'error')
 */
function showFeedback(message, type = 'info') {
  // Use existing feedback function if available
  if (window.workoutStorage && window.workoutStorage.showFeedback) {
    window.workoutStorage.showFeedback(message, type);
    return;
  }
  
  // Otherwise create a simple toast notification
  let feedbackEl = document.getElementById('feedback-message');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'feedback-message';
    feedbackEl.className = 'feedback-message';
    document.body.appendChild(feedbackEl);
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
 * Add CSS styles for network status indicators if not already present
 */
function addNetworkStatusStyles() {
  // Check if styles already exist
  if (document.getElementById('network-status-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'network-status-styles';
  style.textContent = `
    .network-status {
      position: fixed;
      top: 70px;
      right: 20px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      opacity: 1;
    }
    
    .network-status.hidden {
      opacity: 0;
      transform: translateY(-10px);
      pointer-events: none;
    }
    
    .network-status.online {
      background-color: var(--success-light, #dcfce7);
      color: var(--success-color, #22c55e);
      border: 1px solid var(--success-color, #22c55e);
    }
    
    .network-status.offline {
      background-color: var(--warning-light, #fef3c7);
      color: var(--warning-color, #f59e0b);
      border: 1px solid var(--warning-color, #f59e0b);
    }
    
    .status-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 8px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .online .status-icon {
      background-color: var(--success-color, #22c55e);
      color: white;
    }
    
    .offline .status-icon {
      background-color: var(--warning-color, #f59e0b);
      color: white;
    }
    
    @media (prefers-color-scheme: dark) {
      .network-status.online {
        background-color: rgba(34, 197, 94, 0.2);
      }
      
      .network-status.offline {
        background-color: rgba(245, 158, 11, 0.2);
      }
    }
    
    @media (max-width: 600px) {
      .network-status {
        top: auto;
        bottom: 20px;
        right: 20px;
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Check connection quality
function checkConnectionQuality() {
  // Use the Network Information API if available
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      showFeedback('Slow connection detected. Some features may be limited.', 'warning');
    }
    
    // Listen for connection changes
    connection.addEventListener('change', () => {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        showFeedback('Connection speed changed. Some features may be limited.', 'warning');
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initNetworkStatus();
  checkConnectionQuality();
  
  // Check for service worker support
  if ('serviceWorker' in navigator) {
    // Listen for service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      showFeedback('App updated. Refresh for the latest version.', 'info');
    });
  }
});

// Export functions for use in other scripts
window.networkStatus = {
  init: initNetworkStatus,
  update: updateNetworkStatus,
  check: checkConnectionQuality
};