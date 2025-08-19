Effective Learning Backend
This project is the backend for an educational platform, built using Node.js, Express.js, and MongoDB. It's designed to provide API endpoints for managing users, handling file uploads, and connecting to a database.

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
You'll need to have the following software installed on your machine:

Node.js (version 18 or higher is recommended)

npm (Node Package Manager)

MongoDB (running locally or a cloud-based instance like MongoDB Atlas)

Installation
Clone the repository:

git clone https://github.com/adityadahiya12/effective-learning.git
cd effective-learning

Install dependencies:

npm install

Set up environment variables:
Create a .env file in the root directory of the project and add the following variables. Replace the placeholder values with your actual configuration.

PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/effective-learning
CORS_ORIGIN=http://localhost:8000

Running the Project
To start the development server, run the following command. The dev script uses nodemon to automatically restart the server whenever you make changes to your code.

npm run dev

The server will be running at http://localhost:8000.

🛠️ API Endpoints
The following API endpoints are currently available. All endpoints are prefixed with /api/v1/users.

User Registration
POST /api/v1/users/register

Registers a new user.

Middleware: This route uses multer to handle file uploads for the avatar and coverImage.

📂 Project Structure
src/index.js: The main entry point of the application. It connects to the database and starts the Express server.

src/app.js: Configures the Express application with middleware for CORS, request body parsing, and static file serving. It also integrates the user router.

src/db/index.js: Contains the logic for connecting to the MongoDB database.

src/routes/user.routes.js: Defines the API routes specifically for user-related operations.

src/controllers/user.controller.js: (To be implemented) Contains the controller functions for the user routes, such as registerUser.

src/middlewares/multer.middleware.js: (To be implemented) Middleware for handling file uploads.

src/utils/: A directory for utility files like ApiError.js, ApiResponse.js, and asyncHandler.js.
