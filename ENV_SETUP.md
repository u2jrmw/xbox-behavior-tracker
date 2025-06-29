# Environment Variables Setup

## Local Development (.env.local)

```env
# For local development with PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/xbox_tracker"

# Or keep SQLite for local development
# DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="NTR5GNymMs+B/Vb6WpNFvoQqZfURzllhoJSJ+4vpQOI="
NEXTAUTH_URL="http://localhost:3000"
```

## Production Environment Variables

### Vercel Deployment
Add these in your Vercel project dashboard:

```env
DATABASE_URL="postgresql://username:password@your-neon-db.neon.tech/xbox_tracker?sslmode=require"
NEXTAUTH_SECRET="NTR5GNymMs+B/Vb6WpNFvoQqZfURzllhoJSJ+4vpQOI="
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

### Railway Deployment
Add these in your Railway project dashboard:

```env
DATABASE_URL="postgresql://username:password@your-railway-db:5432/railway"
NEXTAUTH_SECRET="NTR5GNymMs+B/Vb6WpNFvoQqZfURzllhoJSJ+4vpQOI="
NEXTAUTH_URL="https://your-app-name.up.railway.app"
```

## How to Get Database URLs

### Neon (Recommended for Vercel)
1. Sign up at https://neon.tech
2. Create new project: "xbox-behavior-tracker" 
3. Copy connection string from dashboard
4. Format: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Railway Database
1. Add PostgreSQL service in Railway dashboard
2. Railway auto-generates DATABASE_URL
3. Use the provided connection string

### Supabase (Alternative)
1. Sign up at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`

## Security Notes

- **Never commit .env files** to version control
- **Use different secrets** for production vs development  
- **Rotate secrets** periodically
- **Restrict database access** to your application only 