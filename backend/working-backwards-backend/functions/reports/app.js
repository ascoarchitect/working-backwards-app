const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const workshopTable = process.env.WORKSHOPS_TABLE;
const participantTable = process.env.PARTICIPANTS_TABLE;
const painPointTable = process.env.PAIN_POINTS_TABLE;
const useCaseTable = process.env.USE_CASES_TABLE;
const actionPlanTable = process.env.ACTION_PLANS_TABLE;
const jwtSecret = process.env.JWT_SECRET;

const verifyToken = (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const generateReport = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    const token = event.headers.Authorization?.split(' ')[1];
    const user = verifyToken(token);

    const userParticipantResult = await dynamoDB.query({
      TableName: participantTable,
      IndexName: 'WorkshopUserIndex',
      KeyConditionExpression: 'workshopId = :workshopId AND userId = :userId',
      ExpressionAttributeValues: {
        ':workshopId': workshopId,
        ':userId': user.id
      }
    }).promise();

    if (!userParticipantResult.Items || userParticipantResult.Items.length === 0) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'You are not a participant in this workshop' })
      };
    }

    const workshopResult = await dynamoDB.get({
      TableName: workshopTable,
      Key: {
        id: workshopId
      }
    }).promise();

    if (!workshopResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Workshop not found' })
      };
    }

    const participantsResult = await dynamoDB.query({
      TableName: participantTable,
      IndexName: 'WorkshopIndex',
      KeyConditionExpression: 'workshopId = :workshopId',
      ExpressionAttributeValues: {
        ':workshopId': workshopId
      }
    }).promise();

    const painPointsResult = await dynamoDB.query({
      TableName: painPointTable,
      IndexName: 'WorkshopIndex',
      KeyConditionExpression: 'workshopId = :workshopId',
      ExpressionAttributeValues: {
        ':workshopId': workshopId
      }
    }).promise();

    const useCasesResult = await dynamoDB.query({
      TableName: useCaseTable,
      IndexName: 'WorkshopIndex',
      KeyConditionExpression: 'workshopId = :workshopId',
      ExpressionAttributeValues: {
        ':workshopId': workshopId
      }
    }).promise();

    const useCases = useCasesResult.Items || [];
    const actionPlans = [];

    for (const useCase of useCases) {
      const actionPlansResult = await dynamoDB.query({
        TableName: actionPlanTable,
        IndexName: 'UseCaseIndex',
        KeyConditionExpression: 'useCaseId = :useCaseId',
        ExpressionAttributeValues: {
          ':useCaseId': useCase.id
        }
      }).promise();

      if (actionPlansResult.Items && actionPlansResult.Items.length > 0) {
        actionPlans.push(...actionPlansResult.Items);
      }
    }

    const report = {
      workshop: workshopResult.Item,
      participants: participantsResult.Items || [],
      painPoints: painPointsResult.Items || [],
      useCases: useCases,
      actionPlans: actionPlans,
      generatedAt: new Date().toISOString(),
      generatedBy: user.id
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ report })
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error generating report' })
    };
  }
};

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

  const path = event.path;
  const method = event.httpMethod;

  if (path.match(/^\/workshops\/[a-zA-Z0-9-]+\/report$/) && method === 'GET') {
    return generateReport(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
