const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

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
    
    console.log('Seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData();
