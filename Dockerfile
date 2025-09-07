FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY .env.development .env

RUN npm run build

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Expose nothing (Discord bot is outbound only)

# Default command
CMD ["node", "./dist/index.js"]