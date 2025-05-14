/**
 * Action Plans Response Handler
 * 
 * This module provides a utility function to ensure that the action plans API response
 * is properly formatted for the frontend components.
 */

/**
 * Ensures that the action plans API response has the expected format
 * with an actionPlans array property, even if the API returns an error
 * or a different format.
 * 
 * @param {Object|null} response - The API response object
 * @returns {Object} A properly formatted response with an actionPlans array
 */
export const ensureActionPlansFormat = (response) => {
  // If response is null or undefined, return an empty actionPlans array
  if (!response) {
    console.warn('Action plans response is null or undefined');
    return { actionPlans: [] };
  }

  // If response already has an actionPlans property that is an array, return it as is
  if (response.actionPlans && Array.isArray(response.actionPlans)) {
    return response;
  }

  // If response is an array, wrap it in an object with actionPlans property
  if (Array.isArray(response)) {
    console.warn('Action plans response is an array, wrapping in object');
    return { actionPlans: response };
  }

  // If response is an object but doesn't have an actionPlans property,
  // add an empty actionPlans array
  console.warn('Action plans response missing actionPlans property');
  return { ...response, actionPlans: [] };
};

/**
 * Error handler for action plans API requests
 * 
 * @param {Error} error - The error object
 * @returns {Object} A properly formatted response with an empty actionPlans array
 */
export const handleActionPlansError = (error) => {
  console.error('Error fetching action plans:', error);
  return { actionPlans: [] };
};
