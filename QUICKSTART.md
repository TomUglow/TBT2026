# 🚀 QUICK START GUIDE

## Step-by-Step Setup (5 minutes)

### 1. Open in VS Code
- Open this entire folder in VS Code
- Open the integrated terminal (Ctrl/Cmd + `)

### 2. Install Everything
```bash
npm install
```

### 3. Get Your Database Ready

**Easiest Way - Supabase (Free):**
1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Create a new project (give it any name)
4. Wait 2 minutes for setup
5. Go to Project Settings (⚙️ icon) → Database
6. Copy the "Connection string" under "Connection pooling"
7. It looks like: `postgresql://postgres.[xxx]:[password]@[region].pooler.supabase.com:5432/postgres`

### 4. Create .env File
```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and paste your database URL:
```
DATABASE_URL="your-supabase-connection-string-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string-works-for-now"
```

### 5. Create Database Tables
```bash
npx prisma db push
```

You should see: "✔ Your database is now in sync with your Prisma schema."

### 6. Start the App!
```bash
npm run dev
```

Open http://localhost:3000 🎉

## First Time Using It

The app will redirect to `/login` but you won't have an account yet.

**Create a test user:**
1. Run `npm run db:studio` in another terminal
2. This opens http://localhost:5555
3. Click "User" table
4. Click "Add record"
5. Fill in:
   - email: test@test.com
   - password: (any text - we'll fix auth later)
   - name: Test User
6. Save

Now you can "login" (it won't check password yet - that's next!)

## What's Working Now

✅ Full UI with your brand colors
✅ Database structure
✅ API routes (events, picks, leaderboard)
✅ Basic navigation
✅ Responsive design

## What to Build Next

1. **Real Authentication** - Hash passwords properly
2. **Add Events** - Use Prisma Studio or create an admin page
3. **Registration Page** - Let users sign up
4. **Sports API** - Pull in real events
5. **Deploy** - Push to Vercel

## Need Help?

- Next.js issues? Check `npm run dev` output
- Database problems? Verify your DATABASE_URL in .env
- Can't find something? Check the full README.md

**Stuck?** Delete `node_modules` and `.next`, then:
```bash
npm install
npm run dev
```

---

That's it! You now have a production-ready foundation. 🚀
