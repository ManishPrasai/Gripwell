FROM node:20-alpine

WORKDIR /app

# Crucial fix: Tell Next.js to safely bypass native binary locks
ENV NEXT_DISABLE_SWC_LAUNCH_FLAG=true
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["npm", "run", "dev"]