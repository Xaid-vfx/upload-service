const axios = require('axios');

const REQUIRED_DEPENDENCIES = ['next', 'react', 'react-dom'];
const REQUIRED_SCRIPTS = ['next dev', 'next build', 'next start'];
const NEXT_CONFIG_FILES = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
const REQUIRED_DIRECTORIES = ['pages', 'app'];

const getDefaultBranch = async (repoUrl) => {
  try {
    // Extract owner and repo from URL
    const [owner, repo] = repoUrl
      .replace('https://github.com/', '')
      .split('/')
      .filter(Boolean);

    // Get repository info from GitHub API
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
    return response.data.default_branch;
  } catch (error) {
    console.error('Error getting default branch:', error.message);
    throw new Error('Could not access repository. Make sure it exists and is public.');
  }
};

const getPackageJson = async (owner, repo, branch) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${branch}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    // Decode the content from base64
    const content = Buffer.from(response.data.content, 'base64').toString();
    return JSON.parse(content);
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('package.json not found');
    }
    throw error;
  }
};

const checkFileExists = async (owner, repo, branch, path) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const checkDirectoryExists = async (owner, repo, branch, path) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    // GitHub API returns an array for directories and an object for files
    // We also need to check if the response is not empty
    return Array.isArray(response.data) && response.data.length > 0;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    console.error(`Error checking directory ${path}:`, error.message);
    return false;
  }
};

const isNextJsProject = async (repoUrl) => {
  try {
    // Extract owner and repo from URL
    const [owner, repo] = repoUrl
      .replace('https://github.com/', '')
      .split('/')
      .filter(Boolean);

    // Get the default branch
    const defaultBranch = await getDefaultBranch(repoUrl);

    // 1. Check if package.json exists and has next dependency
    let packageJson;
    try {
      packageJson = await getPackageJson(owner, repo, defaultBranch);
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      if (!dependencies.next) {
        console.error('Next.js dependency not found in package.json');
        return false;
      }
    } catch (error) {
      console.error('Error with package.json:', error.message);
      return false;
    }

    // 2. Check for next.config.js
    const hasNextConfig = await checkFileExists(owner, repo, defaultBranch, 'next.config.js');
    if (!hasNextConfig) {
      console.error('next.config.js not found');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating repository:', error.message);
    return false;
  }
};

module.exports = {
  isNextJsProject
}; 