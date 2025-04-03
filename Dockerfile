# Use Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install


# Copy the application code
COPY . .


RUN npx prisma migrate dev --name init


# Generate the Prisma client
RUN npx prisma generate


# Expose the app port
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "dev"]
