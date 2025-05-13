# Working Backwards Workshop Application

A serverless web application that digitizes the "Working Backwards" workshop process for software development teams. The application guides users through a structured ideation and prioritization process.

## Architecture

### Frontend
- React with TypeScript
- Vite for building and deployment
- Tailwind CSS for styling
- React Router for navigation

### Backend
- AWS Serverless (Lambda, API Gateway, DynamoDB, S3)
- AWS SAM for deployment
- Node.js 18.x runtime for Lambda functions

## Application Flow

1. Users create a new workshop session with participants
2. Individual participants submit their SDLC pain points
3. System consolidates similar items for group review
4. Teams develop these into formal use cases with all required fields
5. Teams score use cases using the prioritization matrix
6. Top-scoring use cases are selected for detailed action planning
7. Final plans are saved and can be displayed as a report

## Features

- User authentication and authorization
- Real-time collaboration
- Intuitive, responsive UI
- Secure data storage in DynamoDB
- Admin controls for workshop facilitators
- Comprehensive reporting

## Local Development

### Prerequisites

- Node.js v22 or later
- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

```bash
cd backend/working-backwards-backend
npm install
sam build
sam local start-api
```

The local API will be available at http://localhost:3000

## Deployment

The application uses GitHub Actions for CI/CD. When changes are pushed to the main branch, the workflow will:

1. Lint and test the frontend and backend code
2. Build the frontend and backend
3. Deploy the frontend to S3
4. Deploy the backend using AWS SAM

### Manual Deployment

#### Frontend

```bash
cd frontend
npm run build
aws s3 sync dist s3://your-bucket-name --delete
```

#### Backend

```bash
cd backend/working-backwards-backend
sam build
sam deploy --guided
```

## Environment Variables

### Frontend

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_URL=https://your-api-gateway-url.execute-api.eu-west-2.amazonaws.com/Prod
```

### Backend

Environment variables for the backend are managed through the SAM template.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
