const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const actionPlanTable = process.env.ACTION_PLANS_TABLE;
const useCaseTable = process.env.USE_CASES_TABLE;

const getActionPlans = async (event) => {
  try {
    const { useCaseId } = event.pathParameters;

    const useCaseResult = await dynamoDB.get({
      TableName: useCaseTable,
      Key: {
        id: useCaseId
      }
    }).promise();

    if (!useCaseResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Use case not found' })
      };
    }


    const actionPlansResult = await dynamoDB.query({
      TableName: actionPlanTable,
      IndexName: 'UseCaseIndex',
      KeyConditionExpression: 'useCaseId = :useCaseId',
      ExpressionAttributeValues: {
        ':useCaseId': useCaseId
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ actionPlans: actionPlansResult.Items || [] })
    };
  } catch (error) {
    console.error('Error getting action plans:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error getting action plans' })
    };
  }
};

const createActionPlan = async (event) => {
  try {
    const { useCaseId } = event.pathParameters;
    const { 
      title, 
      description, 
      tasks,
      owner,
      dueDate,
      createdBy,
      createdByName
    } = JSON.parse(event.body);
    
    const useCaseResult = await dynamoDB.get({
      TableName: useCaseTable,
      Key: {
        id: useCaseId
      }
    }).promise();

    if (!useCaseResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Use case not found' })
      };
    }

    const workshopId = useCaseResult.Item.workshopId;


    const actionPlanId = uuidv4();
    const newActionPlan = {
      id: actionPlanId,
      useCaseId,
      workshopId,
      title,
      description,
      tasks: tasks || [],
      owner: owner || '',
      dueDate: dueDate || null,
      status: 'pending',
      createdBy: createdBy || 'anonymous',
      createdByName: createdByName || 'Anonymous User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: actionPlanTable,
      Item: newActionPlan
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Action plan created successfully',
        actionPlan: newActionPlan
      })
    };
  } catch (error) {
    console.error('Error creating action plan:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error creating action plan' })
    };
  }
};

const updateActionPlan = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { 
      title, 
      description, 
      tasks,
      owner,
      dueDate,
      status
    } = JSON.parse(event.body);
    
    const actionPlanResult = await dynamoDB.get({
      TableName: actionPlanTable,
      Key: {
        id
      }
    }).promise();

    if (!actionPlanResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Action plan not found' })
      };
    }


    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (title) {
      updateExpression.push('#title = :title');
      expressionAttributeValues[':title'] = title;
      expressionAttributeNames['#title'] = 'title';
    }

    if (description) {
      updateExpression.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }

    if (tasks) {
      updateExpression.push('tasks = :tasks');
      expressionAttributeValues[':tasks'] = tasks;
    }

    if (owner) {
      updateExpression.push('#owner = :owner');
      expressionAttributeValues[':owner'] = owner;
      expressionAttributeNames['#owner'] = 'owner';
    }

    if (dueDate) {
      updateExpression.push('dueDate = :dueDate');
      expressionAttributeValues[':dueDate'] = dueDate;
    }

    if (status) {
      updateExpression.push('#status = :status');
      expressionAttributeValues[':status'] = status;
      expressionAttributeNames['#status'] = 'status';
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    await dynamoDB.update({
      TableName: actionPlanTable,
      Key: {
        id
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    }).promise();

    const updatedActionPlanResult = await dynamoDB.get({
      TableName: actionPlanTable,
      Key: {
        id
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
        message: 'Action plan updated successfully',
        actionPlan: updatedActionPlanResult.Item
      })
    };
  } catch (error) {
    console.error('Error updating action plan:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error updating action plan' })
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

  if (path.match(/^\/usecases\/[a-zA-Z0-9-]+\/actionplans$/) && method === 'GET') {
    return getActionPlans(event);
  } else if (path.match(/^\/usecases\/[a-zA-Z0-9-]+\/actionplans$/) && method === 'POST') {
    return createActionPlan(event);
  } else if (path.match(/^\/usecases\/[a-zA-Z0-9-]+\/actionplans\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
    return updateActionPlan(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
