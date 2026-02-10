import swaggerJsdoc from "swagger-jsdoc";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "be_health_service API",
      version: "1.0.0",
      description: "API documentation for the be_health_service application.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      }
    },
    servers: [
      {
        url: "https://be.blueera.ai/api/health-service/",
        description: "Production server",
      },
      { url: "http://localhost:3000", description: "Development server" },
   
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/hospitalRoutes/*.js", "./src/routes/*.js", "./src/routes/medicalRoutes/*.js"],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
