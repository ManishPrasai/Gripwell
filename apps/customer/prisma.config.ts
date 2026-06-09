import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: '../../packages/database/prisma/schema.prisma',
  datasourceUrl: process.env.DATABASE_URL,
})
