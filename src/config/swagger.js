import swaggerJsdoc from "swagger-jsdoc";
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "be_health_service API",
      version: "1.0.0",
      description: "API documentation for the be_health_service application.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
    ],
    tags: [
      {
        name: "Modules",
        description: "Platform modules and feature configuration",
      },
      {
        name: "Locations",
        description: "Serviceability and location management",
      },
      { name: "CatalogNodes", description: "Catalog node management" },
      {
        name: "Offerings",
        description: "Sellable offerings and service definitions",
      },
      { name: "Catalog", description: "Catalog aggregation and search APIs" },
      {
        name: "Packages",
        description: "Package composition and bundled offerings",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
