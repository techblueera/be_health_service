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
      },
      schemas: {
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Category ID" },
            name: { type: "string" },
            key: {
              type: "string",
              description: "Unique, human-readable identifier",
            },
            description: { type: "string" },
            parentId: {
              type: "string",
              nullable: true,
              description: "ID of the parent category",
            },
            level: {
              type: "number",
              description: "Hierarchy level of the category",
            },
            image: { type: "string", description: "URL of the category image" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Product ID" },
            businessId: { type: "string", description: "Business ID" },
            name: { type: "string" },
            description: { type: "string" },
            brand: { type: "string" },
            subCategory: { type: "string", description: "SubCategory ID" },
            tags: { type: "array", items: { type: "string" } },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  altText: { type: "string" },
                },
              },
            },
            isActive: { type: "boolean" },
            isVegetarian: { type: "boolean" },
            countryOfOrigin: { type: "string" },
            nutritionalInfo: { type: "object" },
          },
        },
        ProductVariant: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Product Variant ID" },
            businessId: { type: "string", description: "Business ID" },
            product: { type: "string", description: "Product ID" },
            variantName: { type: "string" },
            unit: { type: "string" },
            sku: { type: "string" },
            barcode: { type: "string" },
            pricing: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pincode: { type: "string" },
                  cityName: { type: "string" },
                  mrp: { type: "number" },
                  sellingPrice: { type: "number" },
                  currency: { type: "string" },
                },
              },
            },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  altText: { type: "string" },
                },
              },
            },
            dimensions: {
              type: "object",
              properties: {
                length: { type: "number" },
                width: { type: "number" },
                height: { type: "number" },
              },
            },
            weight: { type: "number" },
          },
        },
        Inventory: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Inventory ID" },
            businessId: { type: "string", description: "Business ID" },
            productVariant: {
              type: "string",
              description: "Product Variant ID",
            },
            pincode: { type: "string" },
            cityName: { type: "string" },
            batches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  batchNumber: { type: "string" },
                  quantity: { type: "number" },
                  mfgDate: { type: "string", format: "date-time" },
                  expiryDate: { type: "string", format: "date-time" },
                  mrp: { type: "number" },
                  sellingPrice: { type: "number" },
                },
              },
            },
            supplierInfo: {
              type: "object",
              properties: {
                name: { type: "string" },
                contact: { type: "string" },
              },
            },
            location: {
              type: "object",
              properties: {
                aisle: { type: "string" },
                shelf: { type: "string" },
              },
            },
            reorderPoint: { type: "number" },
            totalStock: { type: "number", readOnly: true },
          },
        },
        ProductWithVariants: {
          allOf: [
            { $ref: "#/components/schemas/Product" },
            {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ProductVariant" },
                },
              },
            },
          ],
        },
        ProductWithVariantsAndInventory: {
          allOf: [
            { $ref: "#/components/schemas/Product" },
            {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    allOf: [
                      { $ref: "#/components/schemas/ProductVariant" },
                      {
                        type: "object",
                        properties: {
                          inventory: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Inventory" },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        Services: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Service ID" },
            product: { type: "string", description: "CatalogNode ID" },
            serviceType: {
              type: "string",
              enum: ["LAB_TEST", "LAB_PACKAGE", "PROCEDURE", "CONSULTATION"],
            },
            name: { type: "string" },
            description: { type: "string" },
            labDetails: {
              type: "object",
              properties: {
                sampleType: { type: "string" },
                fastingRequired: { type: "boolean" },
                fastingHours: { type: "number" },
                tatHours: { type: "number" },
                parameters: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      unit: { type: "string" },
                      referenceRange: { type: "string" },
                    },
                  },
                },
              },
            },
            includedServices: {
              type: "array",
              items: { type: "string", description: "Service ID" },
            },
            pricing: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pincode: { type: "string" },
                  cityName: { type: "string" },
                  mrp: { type: "number" },
                  sellingPrice: { type: "number" },
                  currency: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
      {
        url: "https://be.blueera.ai/api/health-service/",
        description: "Production server",
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/hospitalRoutes/*.js"],
};
const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
