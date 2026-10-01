# Business Card REST API

## Overview
This project is a complete REST API built with Node.js, Express, and MongoDB. It serves as a backend management system for users and business cards, featuring user registration, secure authentication, role-based authorization (Admin, Business, Regular user), and full CRUD functionality for business cards.

## Technologies Used
* **Server Framework:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Security & Auth:** bcryptjs (password hashing), jsonwebtoken (JWT)
* **Validation:** Joi
* **Utilities:** dotenv, morgan (logging), cors

## Setup and Installation
1. Clone the repository to your local machine.
2. Run `npm install` to install all dependencies.
3. Create a `.env` file in the root directory and add your environment variables:
   * `PORT=3000`
   * `MONGODB_URI=mongodb://localhost:27017/your_db_name`
   * `JWT_SECRET=your_jwt_secret_key`
4. Start the server by running `node server.js`.

## API Endpoints & Functionality

### Users Routes
* `POST /users` - Register a new user (Validates data and encrypts password).
* `POST /users/login` - Authenticate a user and receive a JWT token.
* `GET /users` - Retrieve all users (Admin only).
* `GET /users/:id` - Retrieve a specific user (Admin or the registered user).
* `PUT /users/:id` - Edit user details (The registered user).
* `PATCH /users/:id` - Update business status (The registered user).
* `DELETE /users/:id` - Delete user account (Admin or the registered user).

### Cards Routes
* `GET /cards` - Retrieve all business cards (Open to all).
* `GET /cards/my-cards` - Retrieve cards created by the authenticated user.
* `GET /cards/:id` - Retrieve a specific business card by its ID.
* `POST /cards` - Create a new business card (Restricted to Business users).
* `PUT /cards/:id` - Edit a business card (Restricted to the card creator).
* `PATCH /cards/:id` - Like or unlike a business card (Requires registered user token).
* `DELETE /cards/:id` - Delete a business card (Restricted to the card creator or an Admin).