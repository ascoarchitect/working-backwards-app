const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

AWS.config.update({
  region: 'eu-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.use(cors());
app.use(express.json());

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const params = {
      TableName: 'UserTable',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
    
    const existingUser = await dynamoDB.query(params).promise();
    
    if (existingUser.Items && existingUser.Items.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role: role || 'participant',
      createdAt: new Date().toISOString()
    };
    
    await dynamoDB.put({
      TableName: 'UserTable',
      Item: newUser
    }).promise();
    
    const token = 'mock-jwt-token-' + newUser.id;
    
    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const params = {
      TableName: 'UserTable',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (!result.Items || result.Items.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.Items[0];
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = 'mock-jwt-token-' + user.id;
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const userId = token.split('-').pop();
    
    const params = {
      TableName: 'UserTable',
      Key: {
        id: userId
      }
    };
    
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.Item;
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const apiGatewayUrl = process.env.API_GATEWAY_URL || 'https://api-gateway-url.execute-api.eu-west-2.amazonaws.com/Prod';

app.use('/', createProxyMiddleware({
  target: apiGatewayUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/': '/'
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Content-Type', 'application/json');
  }
}));

app.listen(port, () => {
  console.log(`Local development server running at http://localhost:${port}`);
  console.log(`Proxying requests to ${apiGatewayUrl}`);
});
