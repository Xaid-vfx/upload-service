const express = require('express');
const { nanoid } = require('nanoid');
const router = express.Router();
const deployStore = require('../utils/deployStore');
const triggerBuildWorker = require('../worker/triggerBuild');

// Validate GitHub URL
const isValidGitHubUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').length >= 3;
  } catch {
    return false;
  }
};

// POST /deploy
router.post('/deploy', async (req, res) => {
  const { repoUrl } = req.body;

  // Validate request
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  if (!isValidGitHubUrl(repoUrl)) {
    return res.status(400).json({ error: 'Invalid GitHub repository URL' });
  }

  try {
    // Generate unique deployment ID
    const id = nanoid(10);
    
    // Create deployment record
    const deployment = deployStore.create(id, repoUrl);
    
    // Trigger build worker
    await triggerBuildWorker(id, repoUrl);
    
    // Return deployment info
    res.status(201).json({
      id: deployment.id,
      status: deployment.status,
      url: `https://yourdomain.com/deploy/${deployment.id}`,
      repoUrl: deployment.repoUrl,
      createdAt: deployment.createdAt
    });
  } catch (error) {
    console.error('Deployment creation failed:', error);
    res.status(500).json({ error: 'Failed to create deployment' });
  }
});

// GET /deploy/:id/status
router.get('/deploy/:id/status', (req, res) => {
  const { id } = req.params;
  const deployment = deployStore.get(id);

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment not found' });
  }

  res.json({
    id: deployment.id,
    status: deployment.status,
    url: `https://yourdomain.com/deploy/${deployment.id}`,
    repoUrl: deployment.repoUrl,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt
  });
});

module.exports = router; 