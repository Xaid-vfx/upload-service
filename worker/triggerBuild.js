const deployStore = require('../utils/deployStore');
const { sendDeploymentJob } = require('../utils/sqsService');

// Real build worker trigger using SQS
const triggerBuildWorker = async (id, repoUrl) => {
  console.log(`[Build Worker] Triggering build for deployment ${id}`);
  console.log(`[Build Worker] Repository: ${repoUrl}`);
  
  try {
    // Send deployment job to SQS queue
    const success = await sendDeploymentJob(id, repoUrl);
    
    if (success) {
      // Update local status to building (will be updated by build-service via SQS)
      deployStore.updateStatus(id, 'building');
      console.log(`[Build Worker] Deployment job sent to queue successfully`);
    } else {
      // If SQS fails, mark as failed
      deployStore.updateStatus(id, 'failed');
      throw new Error('Failed to send job to SQS queue');
    }
  } catch (error) {
    console.error(`[Build Worker] Error triggering build:`, error);
    deployStore.updateStatus(id, 'failed');
    throw error;
  }
};

module.exports = triggerBuildWorker; 