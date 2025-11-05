# be_health_service - Backend

Bootstrapped backend for the **be_health_service** application.

## Features

* **Express Server** with ES Modules.
* **Dual Logging**: An ASCII startup banner and a structured application logger.
* **MongoDB Integration** using Mongoose.
* **Swagger API Documentation** at `/api-docs`.
* **AWS Secrets Manager** integration for production environments.
* **Code Quality** with ESLint and Prettier.
* **Testing** with Jest.

## How AWS Secrets Manager is Used

In a **production** environment (`NODE_ENV=production`), the application will automatically attempt to load secrets from AWS Secrets Manager at startup. It expects `AWS_REGION` and `SECRET_NAME` to be set in the environment.

The secrets from AWS are loaded into `process.env`, making them available throughout the application just like variables from the `.env` file. This allows for a secure way to manage database credentials and other sensitive information without hardcoding them.

For **development**, the application uses the variables defined in the `.env` file.

## Prerequisites

* Node.js (v18+) & npm
* MongoDB
* GitHub CLI (`gh`) (optional)

## Running the Application

1.  **Install dependencies:** `npm install`
2.  **Configure environment:** Copy `.env.example` to `.env` and fill in your details.
3.  **Run in development:** `npm run dev`
4.  **Access API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
# be_health_service
