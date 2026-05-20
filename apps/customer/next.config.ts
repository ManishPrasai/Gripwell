import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/*': ['../../packages/database/node_modules/.prisma/client/**/*']
  }
}

export default nextConfig