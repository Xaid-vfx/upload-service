// In-memory store for deployments
const deployments = new Map();

const deployStore = {
  // Create a new deployment
  create: (id, repoUrl) => {
    const deployment = {
      id,
      repoUrl,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    deployments.set(id, deployment);
    return deployment;
  },

  // Get deployment by ID
  get: (id) => {
    return deployments.get(id);
  },

  // Update deployment status
  updateStatus: (id, status) => {
    const deployment = deployments.get(id);
    if (deployment) {
      deployment.status = status;
      deployment.updatedAt = new Date().toISOString();
      deployments.set(id, deployment);
      return deployment;
    }
    return null;
  },

  // List all deployments (for debugging)
  list: () => {
    return Array.from(deployments.values());
  }
};

module.exports = deployStore; 