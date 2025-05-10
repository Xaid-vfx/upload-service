const deployStore = require('../utils/deployStore');

// Simulated build worker trigger
const triggerBuildWorker = async (id, repoUrl) => {
  console.log(`[Build Worker] Starting build for deployment ${id}`);
  console.log(`[Build Worker] Repository: ${repoUrl}`);
  
  // Simulate build process
  setTimeout(() => {
    // In a real implementation, this would be handled by a separate process
    // that updates the deployment status through an API or message queue
    deployStore.updateStatus(id, 'building');
    
    // Simulate build completion after 5 seconds
    setTimeout(() => {
      deployStore.updateStatus(id, 'ready');
      console.log(`[Build Worker] Build completed for deployment ${id}`);
    }, 5000);
  }, 1000);
};

module.exports = triggerBuildWorker; 