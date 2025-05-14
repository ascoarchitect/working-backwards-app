const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const participantTable = process.env.PARTICIPANTS_TABLE;
const workshopTable = process.env.WORKSHOPS_TABLE;
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

const getParticipants = async (event) => {
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

    const participantsResult = await dynamoDB.query({
      TableName: participantTable,
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
      body: JSON.stringify({ participants: participantsResult.Items || [] })
    };
  } catch (error) {
    console.error('Error getting participants:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error getting participants' })
    };
  }
};

const addParticipant = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    const { email, name, role } = JSON.parse(event.body);
    const token = event.headers.Authorization?.split(' ')[1];
    const user = verifyToken(token);

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

    if (workshopResult.Item.facilitator !== user.id) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Only the facilitator can add participants' })
      };
    }

    const existingParticipantResult = await dynamoDB.query({
      TableName: participantTable,
      IndexName: 'WorkshopEmailIndex',
      KeyConditionExpression: 'workshopId = :workshopId AND email = :email',
      ExpressionAttributeValues: {
        ':workshopId': workshopId,
        ':email': email
      }
    }).promise();

    if (existingParticipantResult.Items && existingParticipantResult.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Participant already exists in this workshop' })
      };
    }

    const participantId = uuidv4();
    const newParticipant = {
      id: participantId,
      workshopId,
      userId: null, // Will be set when the user registers
      name,
      email,
      role: role || 'participant',
      joinedAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: participantTable,
      Item: newParticipant
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Participant added successfully',
        participant: newParticipant
      })
    };
  } catch (error) {
    console.error('Error adding participant:', error);
    return {
      statusCode: error.message === 'Invalid token' || error.message === 'No token provided' ? 401 : 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error adding participant' })
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

  if (path.match(/^\/workshop-participants\/[a-zA-Z0-9-]+$/) && method === 'GET') {
    return getParticipants(event);
  } else if (path.match(/^\/workshop-participants\/[a-zA-Z0-9-]+$/) && method === 'POST') {
    return addParticipant(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
