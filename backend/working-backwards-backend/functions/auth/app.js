const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const userTable = process.env.USER_TABLE;
const jwtSecret = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

const register = async (event) => {
  try {
    const { name, email, role } = JSON.parse(event.body);

    const existingUser = await dynamoDB.query({
      TableName: userTable,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (existingUser.Items && existingUser.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User already exists' })
      };
    }

    const userId = uuidv4();
    const newUser = {
      id: userId,
      name,
      email,
      role: role || 'participant',
      createdAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: userTable,
      Item: newUser
    }).promise();

    const token = generateToken(newUser);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'User registered successfully',
        user: newUser,
        token
      })
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Error registering user' })
    };
  }
};

const login = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    const result = await dynamoDB.query({
      TableName: userTable,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    const user = result.Items[0];
    const token = generateToken(user);

    const userWithoutPassword = { ...user };
    if (userWithoutPassword.password) {
      delete userWithoutPassword.password;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      })
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Error logging in' })
    };
  }
};

const getCurrentUser = async (event) => {
  try {
    let userId = null;
    const token = event.headers.Authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        userId = decoded.id;
      } catch (error) {
        console.log('Token verification failed, but continuing without authentication');
      }
    }
    
    if (event.queryStringParameters && event.queryStringParameters.userId) {
      userId = event.queryStringParameters.userId;
    }
    
    if (!userId) {
      const allUsers = await dynamoDB.scan({
        TableName: userTable,
        ProjectionExpression: "id, #name, email, #role",
        ExpressionAttributeNames: {
          "#name": "name",
          "#role": "role"
        }
      }).promise();
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          users: allUsers.Items || []
        })
      };
    }
    
    const result = await dynamoDB.get({
      TableName: userTable,
      Key: {
        id: userId
      }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }

    const userWithoutPassword = { ...result.Item };
    if (userWithoutPassword.password) {
      delete userWithoutPassword.password;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        user: userWithoutPassword
      })
    };
  } catch (error) {
    console.error('Error getting user information:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Error getting user information' })
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

  if (path === '/auth/register' && method === 'POST') {
    return register(event);
  } else if (path === '/auth/login' && method === 'POST') {
    return login(event);
  } else if (path === '/auth/me' && method === 'GET') {
    return getCurrentUser(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
