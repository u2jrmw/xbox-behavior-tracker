# 🚀 Deployment Guide - Xbox Behavior Tracker

## Option 1: Vercel + Neon (Recommended)

### Step 1: Prepare Database for Production

1. **Sign up for Neon** (free): https://neon.tech
2. **Create a new database** called `xbox-behavior-tracker`
3. **Copy the connection string** from Neon dashboard

### Step 2: Update Database Configuration

1. **Update Prisma schema**:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. **Install PostgreSQL client**:
```bash
npm install pg @types/pg
```

3. **Update environment variables**:
```env
# .env.local (for local development)
DATABASE_URL="your-neon-connection-string-here"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 3: Deploy to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`: Your Neon connection string
     - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
     - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Click Deploy!

3. **Run database migrations**:
   - After first deploy, go to Vercel dashboard
   - In your project, go to "Functions" → "Edge Config"
   - Or run manually: `npx prisma db push` with production DATABASE_URL

### Step 4: Seed Production Database

Run this once after deployment:
```bash
# Set production DATABASE_URL in terminal
export DATABASE_URL="your-neon-connection-string"
npx prisma db push
npx prisma db seed
```

## Option 2: Railway (Alternative)

### Step 1: Deploy to Railway

1. **Sign up**: https://railway.app
2. **Connect GitHub** repository
3. **Add PostgreSQL** service in Railway dashboard
4. **Add environment variables**:
   - `DATABASE_URL`: Railway will auto-generate this
   - `NEXTAUTH_SECRET`: Generate random string
   - `NEXTAUTH_URL`: Your Railway domain

### Step 2: Configure Domain

- Railway provides custom domain
- Add your own domain if desired

## 🔧 Pre-Deployment Checklist

- [ ] Database switched to PostgreSQL
- [ ] Environment variables configured
- [ ] GitHub repository created and pushed
- [ ] NEXTAUTH_SECRET generated
- [ ] Production DATABASE_URL obtained
- [ ] Prisma schema updated

## 🌐 Custom Domain (Optional)

### With Vercel:
1. Go to project settings
2. Add custom domain
3. Update DNS records as instructed

### With Railway:
1. Go to project settings
2. Add custom domain
3. Update DNS CNAME to Railway

## 🔒 Security Considerations

1. **Use strong NEXTAUTH_SECRET** (32+ characters)
2. **Enable SSL/HTTPS** (automatic with Vercel/Railway)
3. **Restrict database access** to your app only
4. **Use environment variables** for all secrets
5. **Regular database backups** (Neon provides automatic backups)

## 📊 Monitoring & Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Database Monitoring**: Use Neon/Railway dashboards
- **Error Tracking**: Consider adding Sentry for production

## 💰 Cost Estimates

### Free Tier Limits:
- **Vercel**: 100GB bandwidth, unlimited static requests
- **Neon**: 512MB database, 3 databases
- **Railway**: $5/month after trial

### Paid Plans (if needed):
- **Vercel Pro**: $20/month per user
- **Neon Scale**: $19/month
- **Railway**: Usage-based pricing

## 🚨 Common Issues & Solutions

### Issue: Database Connection Errors
**Solution**: Check DATABASE_URL format and SSL settings

### Issue: NextAuth Errors
**Solution**: Ensure NEXTAUTH_URL matches your domain exactly

### Issue: Build Failures
**Solution**: Check Node.js version compatibility (use Node 18+)

### Issue: Slow Loading
**Solution**: Enable edge functions in Vercel for faster response times

## 🎯 Post-Deployment

1. **Test all functionality** on production
2. **Set up monitoring** alerts
3. **Create backups** strategy
4. **Document** your deployment process
5. **Monitor** usage and performance

Your Xbox Behavior Tracker will be live at:
- Vercel: `https://your-app-name.vercel.app`
- Railway: `https://your-app-name.up.railway.app`

## 🔄 Updates & Maintenance

- **Automatic deployments** from GitHub main branch
- **Database migrations** via Prisma
- **Environment variable** updates via platform dashboards
- **Scaling** handled automatically by platforms 