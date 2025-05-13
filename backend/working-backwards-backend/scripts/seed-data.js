const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

AWS.config.update({
  region: 'eu-west-2'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const workshops = [
  {
    id: uuidv4(),
    name: 'SDLC Improvement Workshop',
    description: 'Identifying pain points in our software development lifecycle',
    facilitator: 'John Doe',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'DevOps Transformation',
    description: 'Working backwards from ideal DevOps practices',
    facilitator: 'Jane Smith',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const createUsers = async () => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);
  
  return [
    {
      id: uuidv4(),
      name: 'John Doe',
      email: 'john@example.com',
      password,
      role: 'facilitator',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Jane Smith',
      email: 'jane@example.com',
      password,
      role: 'participant',
      createdAt: new Date().toISOString()
    }
  ];
};

const createPainPoints = (workshopId) => {
  return [
    {
      id: uuidv4(),
      workshopId,
      title: 'Slow Deployment Process',
      description: 'Our current deployment process takes too long and is error-prone',
      submittedBy: 'John Doe',
      category: 'DevOps',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      workshopId,
      title: 'Manual Testing',
      description: 'Too much manual testing slows down our release cycle',
      submittedBy: 'Jane Smith',
      category: 'QA',
      createdAt: new Date().toISOString()
    }
  ];
};

const createParticipants = (workshopId) => {
  return [
    {
      id: uuidv4(),
      workshopId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'facilitator',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      workshopId,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'participant',
      createdAt: new Date().toISOString()
    }
  ];
};

const seedTable = async (tableName, items) => {
  console.log(`Seeding ${tableName} with ${items.length} items...`);
  
  for (const item of items) {
    const params = {
      TableName: tableName,
      Item: item
    };
    
    try {
      await dynamoDB.put(params).promise();
      console.log(`Added item ${item.id} to ${tableName}`);
    } catch (error) {
      console.error(`Error adding item to ${tableName}:`, error);
    }
  }
};

const seedData = async () => {
  try {
    await seedTable('WorkshopsTable', workshops);
    
    const users = await createUsers();
    await seedTable('UserTable', users);
    
    for (const workshop of workshops) {
      const painPoints = createPainPoints(workshop.id);
      await seedTable('PainPointsTable', painPoints);
      
      const participants = createParticipants(workshop.id);
      await seedTable('ParticipantsTable', participants);
    }
    
    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData();
