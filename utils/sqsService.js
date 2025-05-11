require('dotenv').config();
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL || 'https://sqs.eu-north-1.amazonaws.com/662779349650/deployment-queue';

/**
 * Sends a deployment job to SQS queue
 * @param {string} id - Deployment ID
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<boolean>} - Success status
 */
const sendDeploymentJob = async (id, repoUrl) => {
  try {
    console.log(`[SQS] Sending deployment job ${id} to queue...`);
    
    const message = {
      id,
      repoUrl,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const command = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageAttributes: {
        messageType: {
          DataType: 'String',
          StringValue: 'deployment'
        },
        jobId: {
          DataType: 'String',
          StringValue: id
        }
      }
    });

    const response = await sqsClient.send(command);
    console.log(`[SQS] Message sent successfully. MessageId: ${response.MessageId}`);
    
    return true;
  } catch (error) {
    console.error(`[SQS] Error sending deployment job:`, error);
    return false;
  }
};

module.exports = {
  sendDeploymentJob
};