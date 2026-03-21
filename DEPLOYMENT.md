# Vercel Deployment Guide

This guide will help you deploy OpenCut to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A GitHub account (for automatic deployments)
3. A PostgreSQL database (recommended: Vercel Postgres or Neon)
4. Upstash Redis account (for rate limiting)
5. (Optional) Cloudflare R2 account (for transcription storage)
6. (Optional) Modal account (for AI transcription)

## Deployment Steps

### 1. Push Code to GitHub

First, push your code to a GitHub repository:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will automatically detect Next.js framework

### 3. Configure Build Settings

Vercel should auto-detect most settings, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (root of the monorepo)
- **Build Command**: `cd apps/web && bun install && bun run build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `bun install`

### 4. Set Environment Variables

Add the following environment variables in Vercel Project Settings:

#### Required Variables

```bash
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_SECRET=your_secure_random_string
```

#### Recommended Variables

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

#### Optional Variables

```bash
MARBLE_WORKSPACE_KEY=your_workspace_key
FREESOUND_CLIENT_ID=your_freesound_client_id
FREESOUND_API_KEY=your_freesound_api_key
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
MODAL_TRANSCRIPTION_URL=your_modal_url
```

### 5. Database Setup

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel project
2. Navigate to Storage > Create Database
3. Select Postgres
4. Copy the `DATABASE_URL` to your environment variables
5. Run migrations:

```bash
# In Vercel CLI
vercel env pull .env.local
cd apps/web
bun run db:push:prod
```

#### Option B: External PostgreSQL

1. Set up a PostgreSQL database (Neon, Supabase, etc.)
2. Add the connection string as `DATABASE_URL`
3. Run migrations locally or via Vercel CLI

### 6. Redis Setup (Upstash)

1. Create a free account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token to your environment variables

### 7. Deploy

Click "Deploy" in Vercel. The build process will:

1. Install dependencies with Bun
2. Build the Next.js application
3. Deploy to Vercel's edge network

### 8. Post-Deployment

After successful deployment:

1. Update `NEXT_PUBLIC_SITE_URL` to your production URL
2. Test the application
3. Set up custom domain (optional)

## Troubleshooting

### Build Fails

- Ensure Bun is available (Vercel supports Bun)
- Check that all environment variables are set
- Review build logs for specific errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel's IP ranges
- Ensure database migrations have been run

### Redis Connection Issues

- Verify Upstash credentials
- Check Redis URL format

## Continuous Deployment

Once set up, Vercel will automatically deploy:

- On every push to main branch
- On pull requests (preview deployments)
- On manual deployments

## Performance Optimization

- Enable Vercel Analytics (already included)
- Use Vercel Image Optimization
- Configure caching headers in `next.config.ts`
- Consider using Vercel Edge Functions for API routes

## Support

For issues specific to OpenCut:
- Check [GitHub Issues](https://github.com/opencut-app/opencut/issues)
- Review [Contributing Guide](.github/CONTRIBUTING.md)

For Vercel deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
