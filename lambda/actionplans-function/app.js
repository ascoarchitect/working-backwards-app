const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(client);
const actionPlanTable = process.env.ACTION_PLANS_TABLE;
const useCaseTable = process.env.USE_CASES_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: ''
    };
  }

  try {
    // Support multiple endpoint patterns
    const path = event.path;
    const method = event.httpMethod;
    
    // Match patterns for action plans endpoints
    const useCaseActionPlansPattern = /^\/usecases\/[a-zA-Z0-9-]+\/actionplans$/;
    const workshopUseCaseActionPlansPattern = /^\/workshop-usecases\/[a-zA-Z0-9-]+\/usecase\/[a-zA-Z0-9-]+\/actionplans$/;
    const workshopActionPlansPattern = /^\/workshop-actionplans\/[a-zA-Z0-9-]+$/;
    
    // Return empty action plans array for all GET requests to prevent frontend errors
    if ((useCaseActionPlansPattern.test(path) || 
         workshopUseCaseActionPlansPattern.test(path) || 
         workshopActionPlansPattern.test(path)) && 
        method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ actionPlans: [] })
      };
    } else {
      console.log('Route not found:', path, method);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Route not found' })
      };
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message || 'Internal server error' })
    };
  }
};
