const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const WORKSHOPS_TABLE = process.env.WORKSHOPS_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Helper function for CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": CORS_ORIGIN,
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json"
};

// Helper function for responses
const response = (statusCode, body) => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
};

// Get all workshops
const getWorkshops = async () => {
  try {
    const params = {
      TableName: WORKSHOPS_TABLE
    };
    
    const result = await dynamoDB.scan(params).promise();
    return response(200, result.Items);
  } catch (error) {
    console.error("Error getting workshops:", error);
    return response(500, { error: "Could not retrieve workshops" });
  }
};

// Create a new workshop
const createWorkshop = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, description, facilitator } = body;
    
    if (!name || !facilitator) {
      return response(400, { error: "Workshop name and facilitator are required" });
    }
    
    const workshop = {
      id: uuidv4(),
      name,
      description: description || "",
      facilitator,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const params = {
      TableName: WORKSHOPS_TABLE,
      Item: workshop
    };
    
    await dynamoDB.put(params).promise();
    return response(201, workshop);
  } catch (error) {
    console.error("Error creating workshop:", error);
    return response(500, { error: "Could not create workshop" });
  }
};

// Get a workshop by ID
const getWorkshop = async (event) => {
  try {
    const workshopId = event.pathParameters.id;
    
    const params = {
      TableName: WORKSHOPS_TABLE,
      Key: {
        id: workshopId
      }
    };
    
    const result = await dynamoDB.get(params).promise();
    
    if (!result.Item) {
      return response(404, { error: "Workshop not found" });
    }
    
    return response(200, result.Item);
  } catch (error) {
    console.error("Error getting workshop:", error);
    return response(500, { error: "Could not retrieve workshop" });
  }
};

// Update a workshop
const updateWorkshop = async (event) => {
  try {
    const workshopId = event.pathParameters.id;
    const body = JSON.parse(event.body);
    
    // Check if workshop exists
    const getParams = {
      TableName: WORKSHOPS_TABLE,
      Key: {
        id: workshopId
      }
    };
    
    const workshopResult = await dynamoDB.get(getParams).promise();
    
    if (!workshopResult.Item) {
      return response(404, { error: "Workshop not found" });
    }
    
    // Update fields
    const { name, description, facilitator, status } = body;
    
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    if (name) {
      updateExpressions.push("#name = :name");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":name"] = name;
    }
    
    if (description !== undefined) {
      updateExpressions.push("#description = :description");
      expressionAttributeNames["#description"] = "description";
      expressionAttributeValues[":description"] = description;
    }
    
    if (facilitator) {
      updateExpressions.push("#facilitator = :facilitator");
      expressionAttributeNames["#facilitator"] = "facilitator";
      expressionAttributeValues[":facilitator"] = facilitator;
    }
    
    if (status) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }
    
    // Always update the updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    
    if (updateExpressions.length === 0) {
      return response(400, { error: "No fields to update" });
    }
    
    const updateParams = {
      TableName: WORKSHOPS_TABLE,
      Key: {
        id: workshopId
      },
      UpdateExpression: "SET " + updateExpressions.join(", "),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW"
    };
    
    const result = await dynamoDB.update(updateParams).promise();
    return response(200, result.Attributes);
  } catch (error) {
    console.error("Error updating workshop:", error);
    return response(500, { error: "Could not update workshop" });
  }
};

// Main handler
exports.handler = async (event) => {
  console.log("Event:", JSON.stringify(event));
  
  // Handle OPTIONS requests for CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": CORS_ORIGIN,
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
      },
      body: ""
    };
  }
  
  // Route requests
  if (event.httpMethod === "GET" && !event.pathParameters) {
    return getWorkshops();
  } else if (event.httpMethod === "POST" && !event.pathParameters) {
    return createWorkshop(event);
  } else if (event.httpMethod === "GET" && event.pathParameters && event.pathParameters.id) {
    return getWorkshop(event);
  } else if (event.httpMethod === "PUT" && event.pathParameters && event.pathParameters.id) {
    return updateWorkshop(event);
  } else {
    return response(400, { error: "Invalid request" });
  }
};
