
# Build Stage
FROM node:18-alpine AS build

WORKDIR /nextapp

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy the entire app
COPY . .

# Generate Prisma client (if using Prisma)
RUN npx prisma generate

# Build Next.js for production
RUN npm run build

# Production Stage
FROM node:18-alpine AS production

WORKDIR /nextapp

# Copy only the necessary files from the build stage
COPY --from=build /nextapp/package*.json ./
COPY --from=build /nextapp/node_modules ./node_modules
COPY --from=build /nextapp/.next ./.next
COPY --from=build /nextapp/public ./public
COPY --from=build /nextapp/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
