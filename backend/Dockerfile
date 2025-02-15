# Use Node.js 14 Alpine image
FROM node:14-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Expose the backend port (adjust if necessary)
EXPOSE 3001

# Start the backend server
CMD ["npm", "start"]
