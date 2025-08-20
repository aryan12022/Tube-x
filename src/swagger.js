import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TubeX API",
      version: "1.0.0",
      description: "API documentation for TubeX backend",
    },
    servers: [
      {
        url: "https://tube-x.onrender.com", // deployed backend
      },
      {
        url: "http://localhost:8000", // local dev
      },
    ],
  },
  apis: ["./src/routes/*.js"], // path to your route files
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("📑 Swagger available at /api-docs");
}
