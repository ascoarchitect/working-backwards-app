const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const useCaseTable = process.env.USE_CASES_TABLE;

const getUseCases = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    
    const useCasesResult = await dynamoDB.query({
      TableName: useCaseTable,
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
      body: JSON.stringify({ useCases: useCasesResult.Items || [] })
    };
  } catch (error) {
    console.error('Error getting use cases:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error getting use cases' })
    };
  }
};

const createUseCase = async (event) => {
  try {
    const { workshopId } = event.pathParameters;
    const { 
      title, 
      problemStatement, 
      currentProcess, 
      desiredOutcome, 
      metrics,
      painPointIds,
      createdBy,
      createdByName
    } = JSON.parse(event.body);
    

    const useCaseId = uuidv4();
    const newUseCase = {
      id: useCaseId,
      workshopId,
      title,
      problemStatement,
      currentProcess,
      desiredOutcome,
      metrics: metrics || [],
      painPointIds: painPointIds || [],
      businessImpact: 0,
      feasibility: 0,
      timeToValue: 0,
      totalScore: 0,
      isScored: false,
      createdBy: createdBy || 'anonymous',
      createdByName: createdByName || 'Anonymous User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: useCaseTable,
      Item: newUseCase
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Use case created successfully',
        useCase: newUseCase
      })
    };
  } catch (error) {
    console.error('Error creating use case:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error creating use case' })
    };
  }
};

const updateUseCase = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { 
      title, 
      problemStatement, 
      currentProcess, 
      desiredOutcome, 
      metrics,
      painPointIds 
    } = JSON.parse(event.body);
    

    const useCaseResult = await dynamoDB.get({
      TableName: useCaseTable,
      Key: {
        id
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

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (title) {
      updateExpression.push('#title = :title');
      expressionAttributeValues[':title'] = title;
      expressionAttributeNames['#title'] = 'title';
    }

    if (problemStatement) {
      updateExpression.push('problemStatement = :problemStatement');
      expressionAttributeValues[':problemStatement'] = problemStatement;
    }

    if (currentProcess) {
      updateExpression.push('currentProcess = :currentProcess');
      expressionAttributeValues[':currentProcess'] = currentProcess;
    }

    if (desiredOutcome) {
      updateExpression.push('desiredOutcome = :desiredOutcome');
      expressionAttributeValues[':desiredOutcome'] = desiredOutcome;
    }

    if (metrics) {
      updateExpression.push('metrics = :metrics');
      expressionAttributeValues[':metrics'] = metrics;
    }

    if (painPointIds) {
      updateExpression.push('painPointIds = :painPointIds');
      expressionAttributeValues[':painPointIds'] = painPointIds;
    }

    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    await dynamoDB.update({
      TableName: useCaseTable,
      Key: {
        id
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    }).promise();

    const updatedUseCaseResult = await dynamoDB.get({
      TableName: useCaseTable,
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
        message: 'Use case updated successfully',
        useCase: updatedUseCaseResult.Item
      })
    };
  } catch (error) {
    console.error('Error updating use case:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error updating use case' })
    };
  }
};

const scoreUseCases = async (event) => {
  try {
    const { scores, role } = JSON.parse(event.body);
    
    if (role && role !== 'facilitator') {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Only facilitators can score use cases' })
      };
    }

    const updatedUseCases = [];
    for (const score of scores) {
      const { id, businessImpact, feasibility, timeToValue } = score;

      const totalScore = (businessImpact || 0) + (feasibility || 0) + (timeToValue || 0);

      await dynamoDB.update({
        TableName: useCaseTable,
        Key: {
          id
        },
        UpdateExpression: 'SET businessImpact = :businessImpact, feasibility = :feasibility, timeToValue = :timeToValue, totalScore = :totalScore, isScored = :isScored, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':businessImpact': businessImpact || 0,
          ':feasibility': feasibility || 0,
          ':timeToValue': timeToValue || 0,
          ':totalScore': totalScore,
          ':isScored': true,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }).promise();

      const updatedUseCaseResult = await dynamoDB.get({
        TableName: useCaseTable,
        Key: {
          id
        }
      }).promise();

      updatedUseCases.push(updatedUseCaseResult.Item);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Use cases scored successfully',
        useCases: updatedUseCases
      })
    };
  } catch (error) {
    console.error('Error scoring use cases:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error scoring use cases' })
    };
  }
};

const scoreSingleUseCase = async (event) => {
  try {
    const pathParams = event.pathParameters || {};
    const id = pathParams.id || pathParams.useCaseId;
    const workshopId = pathParams.workshopId;
    const { businessImpact, implementationFeasibility, timeToValue } = JSON.parse(event.body);
    
    // if (role && role !== 'facilitator') {
    //   return {
    //     statusCode: 403,
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Access-Control-Allow-Origin': '*',
    //       'Access-Control-Allow-Credentials': true
    //     },
    //     body: JSON.stringify({ message: 'Only facilitators can score use cases' })
    //   };
    // }

    console.log('Scoring use case with ID:', id);
    console.log('Request body:', JSON.stringify({
      businessImpact,
      implementationFeasibility,
      timeToValue
    }));

    const totalScore = (businessImpact || 0) + (implementationFeasibility || 0) + (timeToValue || 0);

    await dynamoDB.update({
      TableName: useCaseTable,
      Key: {
        id
      },
      UpdateExpression: 'SET businessImpact = :businessImpact, feasibility = :implementationFeasibility, timeToValue = :timeToValue, totalScore = :totalScore, isScored = :isScored, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':businessImpact': businessImpact || 0,
        ':implementationFeasibility': implementationFeasibility || 0,
        ':timeToValue': timeToValue || 0,
        ':totalScore': totalScore,
        ':isScored': true,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    const updatedUseCaseResult = await dynamoDB.get({
      TableName: useCaseTable,
      Key: {
        id
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        message: 'Use case scored successfully',
        useCase: updatedUseCaseResult.Item,
        useCases: useCasesResult.Items || []
      })
    };
  } catch (error) {
    console.error('Error scoring use case:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: error.message || 'Error scoring use case' })
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

  if (path.match(/^\/workshop-usecases\/[a-zA-Z0-9-]+$/) && method === 'GET') {
    return getUseCases(event);
  } else if (path.match(/^\/workshop-usecases\/[a-zA-Z0-9-]+$/) && method === 'POST') {
    return createUseCase(event);
  } else if (path.match(/^\/workshop-usecases\/[a-zA-Z0-9-]+\/usecase\/[a-zA-Z0-9-]+$/) && method === 'PUT') {
    return updateUseCase(event);
  } else if (path.match(/^\/workshop-usecases\/[a-zA-Z0-9-]+\/score$/) && method === 'POST') {
    return scoreUseCases(event);
  } else if (path.match(/^\/workshop-usecases\/[a-zA-Z0-9-]+\/usecase\/[a-zA-Z0-9-]+\/score$/) && method === 'POST') {
    return scoreSingleUseCase(event);
  } else {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  }
};
