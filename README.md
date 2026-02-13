# The Big Tip - Sports Tipping Competition Platform

A modern, full-stack sports prediction competition platform built with Next.js, PostgreSQL, and NextAuth.

## 🚀 Features

- **User Authentication** - Secure login/registration with NextAuth.js
- **Event Management** - Browse and predict outcomes for 50+ sporting events
- **Live Leaderboards** - Real-time rankings and scoring
- **Competition System** - Public and private competitions with customizable rules
- **Responsive Design** - Mobile-first UI with your brand colors
- **Real-time Updates** - Track live events and results

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend Supabase free tier)
- VS Code (or your preferred editor)

## 🎯 Quick Start

### 1. Clone/Download the Project

Download this project folder and open it in VS Code.

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Database

**Option A: Use Supabase (Recommended - Free)**

1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Project Settings → Database
5. Copy the connection string (looks like `postgresql://...`)

**Option B: Use Local PostgreSQL**

Install PostgreSQL locally and use:
```
postgresql://postgres:password@localhost:5432/thebigtip
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
# Database (use your Supabase connection string)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**To generate a secret key:**
```bash
openssl rand -base64 32
```

### 5. Set Up Database Schema

```bash
npx prisma db push
```

This creates all the tables in your database.

### 6. (Optional) Seed Some Test Data

You can add test events manually through Prisma Studio:

```bash
npm run db:studio
```

This opens a visual database editor at `http://localhost:5555`

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📁 Project Structure

```
the-big-tip/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── events/       # Event management
│   │   ├── picks/        # User picks
│   │   └── leaderboard/  # Rankings
│   ├── login/            # Login page
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── lib/                  # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json
```

## 🗄 Database Schema

The app uses these main tables:

- **User** - User accounts and profiles
- **Competition** - Competition details and rules
- **Event** - Sporting events to predict
- **Pick** - User predictions
- **CompetitionUser** - User participation and scores

## 🎨 Brand Colors

Your brand colors are configured in `tailwind.config.js`:

- Primary Red: `#D32F2F`
- Dark Red: `#8B1010`
- Gold: `#FFD700`
- Success Green: `#4CAF50`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET`
5. Deploy!

Vercel automatically handles:
- Serverless functions
- Edge caching
- Automatic HTTPS
- Free hosting for hobby projects

### Database in Production

Keep using Supabase (free tier) or upgrade as needed. Just update `DATABASE_URL` in Vercel's environment variables.

## 🔧 Common Tasks

### Add a New Event

Use Prisma Studio or create an API endpoint:

```typescript
await prisma.event.create({
  data: {
    sport: 'NFL',
    team1Name: 'Kansas City Chiefs',
    team1Abbr: 'KC',
    team1Odds: '-150',
    team2Name: 'Buffalo Bills',
    team2Abbr: 'BUF',
    team2Odds: '+130',
    eventDate: new Date('2026-02-15'),
    status: 'upcoming'
  }
})
```

### Create a User

```bash
npm run db:studio
```

Go to the `User` table and manually create a user with:
- Email
- Password (hash it using bcrypt)

Or create a registration page (coming soon in the app).

### Update the Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Regenerate Prisma Client: `npx prisma generate`

## 🔐 Authentication

The app uses NextAuth.js with credentials provider. To add more providers (Google, Facebook, etc.):

1. Edit `app/api/auth/[...nextauth]/route.ts`
2. Add provider configuration
3. Set up OAuth credentials

## 📊 Integrating Sports APIs

To pull live scores and events, you can integrate APIs like:

- **ESPN API** - For scores and schedules
- **The Odds API** - For betting odds
- **SportsData.io** - Comprehensive sports data

Add API calls in the `app/api/events/route.ts` file.

## 🐛 Troubleshooting

**Database Connection Error**
- Check your `DATABASE_URL` is correct
- Ensure your database is accessible
- For Supabase, verify the connection string includes `?schema=public`

**Build Errors**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`

**Authentication Issues**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again

## 📝 Next Steps

1. **Add Registration** - Build a signup page
2. **Sports API Integration** - Auto-populate events
3. **Payment Integration** - Stripe for entry fees
4. **Email Notifications** - SendGrid or Resend
5. **Admin Panel** - Manage events and users
6. **Mobile App** - React Native version

## 🤝 Support

Need help? Check:
- Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- Prisma docs: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- NextAuth docs: [https://next-auth.js.org](https://next-auth.js.org)

## 📄 License

MIT License - Feel free to use this for your project!

---

Built with ❤️ for The Big Tip
