const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const actionPlanTable = process.env.ACTION_PLANS_TABLE;
const useCaseTable = process.env.USE_CASES_TABLE;

const getActionPlans = async (event) => {
  try {
    // Handle both workshopId and useCaseId patterns
    const { workshopId, useCaseId } = event.pathParameters;

    if (workshopId) {
      // Get action plans by workshop
      const actionPlansResult = await dynamoDB.query({
        TableName: actionPlanTable,
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
        body: JSON.stringify({ actionPlans: actionPlansResult.Items || [] })
      };
    } else if (useCaseId) {
      // Get action plans by use case (existing functionality)
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
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Either workshopId or useCaseId is required' })
      };
    }
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
    // Handle both workshopId and useCaseId patterns
    const { workshopId, useCaseId: pathUseCaseId } = event.pathParameters;
    const { 
      title, 
      description, 
      tasks,
      owner,
      dueDate,
      createdBy,
      createdByName,
      useCaseId: bodyUseCaseId
    } = JSON.parse(event.body);

    let finalWorkshopId = workshopId;
    let finalUseCaseId = pathUseCaseId || bodyUseCaseId;

    if (workshopId && bodyUseCaseId) {
      // Workshop-based creation - useCaseId comes from request body
      finalUseCaseId = bodyUseCaseId;
      finalWorkshopId = workshopId;

      // Validate that the use case belongs to this workshop
      const useCaseResult = await dynamoDB.get({
        TableName: useCaseTable,
        Key: {
          id: finalUseCaseId
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

      if (useCaseResult.Item.workshopId !== workshopId) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({ message: 'Use case does not belong to this workshop' })
        };
      }
    } else if (pathUseCaseId) {
      // Use case-based creation (existing functionality)
      const useCaseResult = await dynamoDB.get({
        TableName: useCaseTable,
        Key: {
          id: pathUseCaseId
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

      finalWorkshopId = useCaseResult.Item.workshopId;
      finalUseCaseId = pathUseCaseId;
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Either workshopId with useCaseId in body, or useCaseId in path is required' })
      };
    }

    const actionPlanId = uuidv4();
    const newActionPlan = {
      id: actionPlanId,
      useCaseId: finalUseCaseId,
      workshopId: finalWorkshopId,
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
    // Handle both pattern types
    const { workshopId, id, actionPlanId } = event.pathParameters;
    const finalActionPlanId = id || actionPlanId;
    
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
        id: finalActionPlanId
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

    // If workshopId is provided, verify the action plan belongs to this workshop
    if (workshopId && actionPlanResult.Item.workshopId !== workshopId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Action plan does not belong to this workshop' })
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
        id: finalActionPlanId
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    }).promise();

    const updatedActionPlanResult = await dynamoDB.get({
      TableName: actionPlanTable,
      Key: {
        id: finalActionPlanId
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

const getActionPlanById = async (event) => {
  try {
    const { workshopId, actionPlanId } = event.pathParameters;
    
    const actionPlanResult = await dynamoDB.get({
      TableName: actionPlanTable,
      Key: {
        id: actionPlanId
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

    // Verify the action plan belongs to this workshop
    if (actionPlanResult.Item.workshopId !== workshopId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Action plan does not belong to this workshop' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ actionPlan: actionPlanResult.Item })
    };
  } catch (error) {
    console.error('Error getting action plan:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error getting action plan' })
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

  // Workshop-based routes (primary) - more specific routes first
  if (path.match(/^\/workshop-actionplans\/[a-zA-Z0-9-]+\/actionplan\/[a-zA-Z0-9-]+$/) && method === 'GET') {
    return getActionPlanById(event);
  } else if (path.match(/^\/workshop-actionplans\/[a-zA-Z0-9-]+\/actionplan\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
    return updateActionPlan(event);
  } else if (path.match(/^\/workshop-actionplans\/[a-zA-Z0-9-]+$/) && method === 'GET') {
    return getActionPlans(event);
  } else if (path.match(/^\/workshop-actionplans\/[a-zA-Z0-9-]+$/) && method === 'POST') {
    return createActionPlan(event);
  }
  // Use case-based routes (legacy support)
  else if (path.match(/^\/usecases\/[a-zA-Z0-9-]+\/actionplans$/) && method === 'GET') {
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
