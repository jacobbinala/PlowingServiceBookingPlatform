# Plowing Service Booking Platform - Server

Backend server for the Plowing Service Booking Platform using Node.js, Express, and MongoDB Atlas.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
PORT=5000
```

## Getting MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new cluster (or use an existing one)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string and replace `<password>` with your database password
7. Replace `<dbname>` with your database name

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` (or the PORT specified in your .env file).

## Project Structure

```
server/
├── config/
│   └── database.js      # MongoDB connection configuration
├── models/              # Mongoose models
├── routes/              # API routes
│   └── index.js
├── .env.example         # Example environment variables
├── .gitignore
├── package.json
├── server.js            # Main server file
└── README.md
```
