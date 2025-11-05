import swaggerJsdoc from 'swagger-jsdoc';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'be_health_service API',
      version: '1.0.0',
      description: 'API documentation for the be_health_service application.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
