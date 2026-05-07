# Ethara AI Task

A full-stack application featuring a React frontend and a Node.js backend for managing projects and tasks.

## Project Structure

The repository is divided into two main sections:

- **/client**: A React single-page application built with Vite.
- **/server**: A Node.js/Express backend REST API.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

## Installation

1. **Server Setup**:
   Navigate to the `server` directory and install the dependencies:
   ```bash
   cd server
   npm install
   ```

2. **Client Setup**:
   Navigate to the `client` directory and install the dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Application

### Starting the Backend
From the root directory, navigate to the `server` folder and start the server:
```bash
cd server
npm start
# or use `node index.js` / `npm run dev` if configured
```

### Starting the Frontend
From the root directory, navigate to the `client` folder and start the Vite development server:
```bash
cd client
npm run dev
```

## Features
- **Authentication**: User login and registration.
- **Project Management**: Create, view, and manage projects.
- **Task Tracking**: Assign and monitor tasks within projects.
- **Role-based Access**: Middleware-protected routes for authorization.
