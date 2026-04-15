# Use a lightweight Node.js Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the command center
CMD ["node", "server.js"]