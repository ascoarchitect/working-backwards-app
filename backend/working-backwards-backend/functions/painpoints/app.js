const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const painPointTable = process.env.PAIN_POINTS_TABLE;
const participantTable = process.env.PARTICIPANTS_TABLE;
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

const getPainPoints = async (event) => {
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

    const painPointsResult = await dynamoDB.query({
      TableName: painPointTable,
      IndexName: 'WorkshopIndex',
      KeyConditionExpression: 'workshopId = :workshopId',
      ExpressionAttributeValues: {
        ':workshopId': workshopId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ painPoints: painPointsResult.Items || [] })
    };
  } catch (error) {
    console.error('Error getting pain points:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error getting pain points' })
    };
  }
};

const addPainPoint = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    const { description, category, impact } = JSON.parse(event.body);
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

    const painPointId = uuidv4();
    const newPainPoint = {
      id: painPointId,
      workshopId,
      description,
      category: category || 'uncategorized',
      impact: impact || 'medium',
      createdBy: user.id,
      createdByName: user.name || 'Unknown',
      isConsolidated: false,
      parentIds: [],
      createdAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: painPointTable,
      Item: newPainPoint
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Pain point added successfully',
        painPoint: newPainPoint
      })
    };
  } catch (error) {
    console.error('Error adding pain point:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error adding pain point' })
    };
  }
};

const consolidatePainPoints = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    const { description, category, impact, painPointIds } = JSON.parse(event.body);
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

    const facilitator = userParticipantResult.Items[0];
    if (facilitator.role !== 'facilitator') {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Only facilitators can consolidate pain points' })
      };
    }

    const consolidatedId = uuidv4();
    const consolidatedPainPoint = {
      id: consolidatedId,
      workshopId,
      description,
      category: category || 'uncategorized',
      impact: impact || 'medium',
      createdBy: user.id,
      createdByName: user.name || 'Unknown',
      isConsolidated: true,
      parentIds: painPointIds,
      createdAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: painPointTable,
      Item: consolidatedPainPoint
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Pain points consolidated successfully',
        painPoint: consolidatedPainPoint
      })
    };
  } catch (error) {
    console.error('Error consolidating pain points:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error consolidating pain points' })
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

  if (path.match(/^\/workshop-painpoints\/[a-zA-Z0-9-]+$/) && method === 'GET') {
    return getPainPoints(event);
  } else if (path.match(/^\/workshop-painpoints\/[a-zA-Z0-9-]+$/) && method === 'POST') {
    return addPainPoint(event);
  } else if (path.match(/^\/workshop-painpoints\/[a-zA-Z0-9-]+\/consolidate$/) && method === 'POST') {
    return consolidatePainPoints(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
