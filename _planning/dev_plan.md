# Beopardy Stats Tracker - Development Document

## Project Overview

A web application to track statistics from the Smosh Pit YouTube channel's "Beopardy" game show (a Jeopardy spinoff). The application will track player statistics across episodes, similar to how NFL stats track both game-level and career-level performance.

### Core Requirements

- Track individual episode statistics
- Track cumulative player career statistics
- Display leaderboards and rankings
- Provide detailed player and episode views
- Admin interface for data entry
- Clean, modern UI with Beopardy-inspired color palette

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| State Management | React Server Components + React Query (for client mutations) |

---

## Design System

### Color Palette

Based on the Beopardy set accent colors:

```css
:root {
  /* Primary Accent - Terracotta Red */
  --color-terracotta: #AC4838;
  --color-terracotta-rgb: 172, 72, 56;
  
  /* Secondary Accent - Dusty Rose */
  --color-dusty-rose: #C57F87;
  --color-dusty-rose-rgb: 197, 127, 135;
  
  /* Tertiary Accent - Golden Mustard */
  --color-golden: #CFB56A;
  --color-golden-rgb: 207, 181, 106;
  
  /* Quaternary Accent - Warm Cream */
  --color-cream: #DACDA3;
  --color-cream-rgb: 218, 205, 163;
  
  /* Neutrals */
  --color-white: #FFFFFF;
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'beo': {
          'terracotta': {
            DEFAULT: '#AC4838',
            light: '#C45A4A',
            dark: '#8A3A2D',
          },
          'rose': {
            DEFAULT: '#C57F87',
            light: '#D4999F',
            dark: '#A6656D',
          },
          'golden': {
            DEFAULT: '#CFB56A',
            light: '#DCC885',
            dark: '#B89D4F',
          },
          'cream': {
            DEFAULT: '#DACDA3',
            light: '#E8DFC0',
            dark: '#C4B586',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Design Principles

1. **Light Theme Primary**: White/off-white backgrounds with accent colors for emphasis
2. **Card-Based Layout**: Content organized in clean, rounded cards with subtle shadows
3. **Accent Usage**:
   - Terracotta (#AC4838): Primary actions, winner highlights, important stats
   - Dusty Rose (#C57F87): Secondary actions, hover states
   - Golden (#CFB56A): Achievements, badges, special callouts
   - Cream (#DACDA3): Backgrounds for highlighted sections, subtle dividers
4. **Typography**: Clean, readable fonts with clear hierarchy
5. **Spacing**: Generous whitespace, consistent padding/margins
6. **Micro-interactions**: Subtle hover effects, smooth transitions

---

## Database Schema

### Tables

#### `players`
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_players_slug ON players(slug);
```

#### `episodes`
```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  season INTEGER DEFAULT 1,
  air_date DATE NOT NULL,
  youtube_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(season, episode_number)
);

CREATE INDEX idx_episodes_air_date ON episodes(air_date DESC);
CREATE INDEX idx_episodes_season ON episodes(season);
```

#### `episode_appearances`
```sql
CREATE TABLE episode_appearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  questions_seen INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  points_scored INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  placement INTEGER CHECK (placement >= 1 AND placement <= 10),
  final_wager INTEGER DEFAULT 0,
  final_correct BOOLEAN,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(episode_id, player_id)
);

CREATE INDEX idx_appearances_episode ON episode_appearances(episode_id);
CREATE INDEX idx_appearances_player ON episode_appearances(player_id);
CREATE INDEX idx_appearances_winner ON episode_appearances(is_winner) WHERE is_winner = TRUE;
```

### Database Views

#### `player_career_stats`
```sql
CREATE OR REPLACE VIEW player_career_stats AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.image_url,
  COUNT(ea.id) AS total_appearances,
  SUM(CASE WHEN ea.is_winner THEN 1 ELSE 0 END) AS total_wins,
  ROUND(
    (SUM(CASE WHEN ea.is_winner THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(ea.id), 0)) * 100, 
    1
  ) AS win_percentage,
  SUM(ea.questions_seen) AS total_questions_seen,
  SUM(ea.questions_correct) AS total_questions_correct,
  ROUND(
    (SUM(ea.questions_correct)::DECIMAL / NULLIF(SUM(ea.questions_seen), 0)) * 100, 
    1
  ) AS accuracy_percentage,
  SUM(ea.points_scored) AS total_points,
  ROUND(SUM(ea.points_scored)::DECIMAL / NULLIF(COUNT(ea.id), 0), 1) AS avg_points_per_appearance,
  MAX(ea.points_scored) AS highest_score,
  MIN(ea.points_scored) AS lowest_score,
  MAX(e.air_date) AS last_appearance,
  MIN(e.air_date) AS first_appearance
FROM players p
LEFT JOIN episode_appearances ea ON p.id = ea.player_id
LEFT JOIN episodes e ON ea.episode_id = e.id
GROUP BY p.id, p.name, p.slug, p.image_url;
```

#### `episode_summary`
```sql
CREATE OR REPLACE VIEW episode_summary AS
SELECT 
  e.id,
  e.title,
  e.episode_number,
  e.season,
  e.air_date,
  e.youtube_url,
  e.thumbnail_url,
  COUNT(ea.id) AS participant_count,
  (
    SELECT p.name 
    FROM episode_appearances ea2 
    JOIN players p ON ea2.player_id = p.id 
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE 
    LIMIT 1
  ) AS winner_name,
  (
    SELECT p.id 
    FROM episode_appearances ea2 
    JOIN players p ON ea2.player_id = p.id 
    WHERE ea2.episode_id = e.id AND ea2.is_winner = TRUE 
    LIMIT 1
  ) AS winner_id,
  MAX(ea.points_scored) AS highest_score
FROM episodes e
LEFT JOIN episode_appearances ea ON e.id = ea.episode_id
GROUP BY e.id, e.title, e.episode_number, e.season, e.air_date, e.youtube_url, e.thumbnail_url;
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_appearances ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access for episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read access for appearances" ON episode_appearances FOR SELECT USING (true);

-- Admin write access (authenticated users only)
CREATE POLICY "Admin insert players" ON players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update players" ON players FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete players" ON players FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert episodes" ON episodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update episodes" ON episodes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete episodes" ON episodes FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert appearances" ON episode_appearances FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update appearances" ON episode_appearances FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete appearances" ON episode_appearances FOR DELETE USING (auth.role() = 'authenticated');
```

---

## Project Structure

```
beopardy-stats/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with providers
│   │   ├── page.tsx                   # Homepage
│   │   ├── players/
│   │   │   ├── page.tsx               # Players list
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Player detail
│   │   ├── episodes/
│   │   │   ├── page.tsx               # Episodes list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Episode detail
│   │   ├── leaderboards/
│   │   │   └── page.tsx               # Leaderboards
│   │   ├── admin/
│   │   │   ├── layout.tsx             # Admin layout with auth check
│   │   │   ├── page.tsx               # Admin dashboard
│   │   │   ├── players/
│   │   │   │   ├── page.tsx           # Manage players
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # Add player
│   │   │   ├── episodes/
│   │   │   │   ├── page.tsx           # Manage episodes
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Add episode
│   │   │   │   └── [id]/
│   │   │   │       └── results/
│   │   │   │           └── page.tsx   # Record episode results
│   │   │   └── login/
│   │   │       └── page.tsx           # Admin login
│   │   └── api/
│   │       ├── players/
│   │       │   └── route.ts
│   │       ├── episodes/
│   │       │   └── route.ts
│   │       └── appearances/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/                        # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Container.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── players/                   # Player-specific components
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayerList.tsx
│   │   │   ├── PlayerStats.tsx
│   │   │   ├── PlayerAppearanceHistory.tsx
│   │   │   └── PlayerForm.tsx
│   │   ├── episodes/                  # Episode-specific components
│   │   │   ├── EpisodeCard.tsx
│   │   │   ├── EpisodeList.tsx
│   │   │   ├── EpisodeResults.tsx
│   │   │   ├── EpisodeForm.tsx
│   │   │   └── ResultsEntryForm.tsx
│   │   ├── stats/                     # Stats display components
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── WinRateChart.tsx
│   │   │   └── PerformanceTrend.tsx
│   │   └── shared/                    # Shared components
│   │       ├── SearchInput.tsx
│   │       ├── SortDropdown.tsx
│   │       ├── Pagination.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   ├── server.ts              # Server client
│   │   │   └── admin.ts               # Admin/service role client
│   │   ├── utils/
│   │   │   ├── formatters.ts          # Number/date formatting
│   │   │   ├── calculations.ts        # Stats calculations
│   │   │   └── slug.ts                # Slug generation
│   │   └── constants.ts               # App constants
│   ├── hooks/
│   │   ├── usePlayer.ts
│   │   ├── usePlayers.ts
│   │   ├── useEpisode.ts
│   │   ├── useEpisodes.ts
│   │   └── useLeaderboard.ts
│   ├── types/
│   │   ├── database.ts                # Generated Supabase types
│   │   ├── player.ts
│   │   ├── episode.ts
│   │   └── stats.ts
│   └── styles/
│       └── globals.css
├── public/
│   ├── images/
│   └── fonts/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seed.sql
├── .env.local.example
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Component Specifications

### Base UI Components

#### Button
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}
```
- Primary variant uses terracotta color
- Secondary uses dusty rose
- Consistent padding, rounded corners (rounded-lg)
- Loading state with spinner

#### Card
```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```
- White background
- Subtle shadow for elevated variant
- Border for outlined variant
- Consistent border-radius (rounded-xl)

#### StatCard
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  accentColor?: 'terracotta' | 'rose' | 'golden' | 'cream';
}
```
- Displays a single stat prominently
- Optional trend indicator
- Accent color stripe on left edge

#### Table
```typescript
interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
}
```
- Clean, minimal table styling
- Hover states on rows
- Sort indicators in headers
- Loading skeleton state

### Feature Components

#### PlayerCard
Displays player summary with:
- Avatar/image
- Name
- Key stats (appearances, win rate, avg points)
- Link to full profile

#### Leaderboard
Sortable rankings table with:
- Rank column with medal icons for top 3
- Player name with avatar
- Configurable stat columns
- Sort by any column

#### EpisodeResults
Episode detail view showing:
- Episode metadata (date, title, YouTube link)
- Results table with all participants
- Winner highlight
- Individual player stats for that episode

---

## API Routes

### Players

#### `GET /api/players`
Returns paginated list of players with career stats.

Query params:
- `page` (default: 1)
- `limit` (default: 20)
- `sort` (default: 'name')
- `order` (default: 'asc')
- `search` (optional)

#### `GET /api/players/[slug]`
Returns single player with full career stats and appearance history.

#### `POST /api/players` (protected)
Creates new player.

Body:
```json
{
  "name": "string",
  "image_url": "string (optional)"
}
```

### Episodes

#### `GET /api/episodes`
Returns paginated list of episodes with summaries.

Query params:
- `page`, `limit`, `sort`, `order`
- `season` (optional)

#### `GET /api/episodes/[id]`
Returns single episode with all participant results.

#### `POST /api/episodes` (protected)
Creates new episode.

#### `POST /api/episodes/[id]/results` (protected)
Records results for an episode.

Body:
```json
{
  "results": [
    {
      "player_id": "uuid",
      "questions_seen": 30,
      "questions_correct": 20,
      "points_scored": 15000,
      "is_winner": true,
      "placement": 1
    }
  ]
}
```

---

## Page Specifications

### Homepage (`/`)
- Hero section with app title and brief description
- Quick stats overview (total episodes, total players, recent winner)
- Recent episodes list (last 5)
- Top performers mini-leaderboard
- Navigation cards to main sections

### Players List (`/players`)
- Search bar
- Grid of PlayerCards
- Sort options (name, appearances, win rate, points)
- Pagination

### Player Detail (`/players/[slug]`)
- Player header with image and name
- Stats grid showing all career stats
- Performance trend chart (optional, Phase 5)
- Appearance history table (all episodes with per-episode stats)

### Episodes List (`/episodes`)
- Filter by season
- List of EpisodeCards with date, title, winner
- Sort by date, episode number
- Pagination

### Episode Detail (`/episodes/[id]`)
- Episode header (title, date, YouTube embed/link)
- Results table showing all participants ranked by placement
- Stat breakdown for each participant

### Leaderboards (`/leaderboards`)
- Tab navigation for different leaderboard types:
  - Most Wins
  - Highest Win Rate (min 3 appearances)
  - Most Points (career)
  - Best Accuracy
  - Most Appearances
- Full sortable table for each

### Admin Dashboard (`/admin`)
- Quick actions (Add Player, Add Episode)
- Recent activity
- Data overview stats

### Admin Forms
- Clean form layouts with validation
- Success/error toast notifications
- Confirmation dialogs for destructive actions

---

## TypeScript Types

```typescript
// types/database.ts - Generated from Supabase, but here's the shape:

export interface Player {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  title: string;
  episode_number: number;
  season: number;
  air_date: string;
  youtube_url: string | null;
  thumbnail_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EpisodeAppearance {
  id: string;
  episode_id: string;
  player_id: string;
  questions_seen: number;
  questions_correct: number;
  points_scored: number;
  is_winner: boolean;
  placement: number | null;
  final_wager: number;
  final_correct: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// types/stats.ts

export interface PlayerCareerStats {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  total_appearances: number;
  total_wins: number;
  win_percentage: number;
  total_questions_seen: number;
  total_questions_correct: number;
  accuracy_percentage: number;
  total_points: number;
  avg_points_per_appearance: number;
  highest_score: number;
  lowest_score: number;
  last_appearance: string;
  first_appearance: string;
}

export interface EpisodeSummary {
  id: string;
  title: string;
  episode_number: number;
  season: number;
  air_date: string;
  youtube_url: string | null;
  thumbnail_url: string | null;
  participant_count: number;
  winner_name: string | null;
  winner_id: string | null;
  highest_score: number;
}

export interface PlayerAppearance extends EpisodeAppearance {
  episode: Episode;
}

export interface EpisodeResult extends EpisodeAppearance {
  player: Player;
}
```

---

## Development Phases

### Phase 1: Database & Supabase Setup (Days 1-2)

**Tasks:**
1. Create Supabase project
2. Run migration SQL to create tables
3. Create database views
4. Set up RLS policies
5. Generate TypeScript types from Supabase
6. Create seed data for testing (5+ players, 3+ episodes)
7. Test queries in Supabase dashboard

**Acceptance Criteria:**
- All tables created with proper relationships
- Views return correct aggregated data
- RLS allows public read, authenticated write
- Seed data queryable

### Phase 2: Project Scaffolding (Days 3-4)

**Tasks:**
1. Initialize Next.js 16 project with TypeScript
2. Configure Tailwind with custom color palette
3. Set up Supabase client utilities (server/client)
4. Create environment variables structure
5. Build base UI components (Button, Card, Input, Table, Badge, Avatar, Skeleton)
6. Create layout components (Header, Footer, Navigation, Container)
7. Set up basic routing structure
8. Deploy skeleton to Vercel

**Acceptance Criteria:**
- App runs locally and on Vercel
- Supabase connection works
- UI components render correctly with theme colors
- Navigation between pages works

### Phase 3: Admin Interface (Days 5-8)

**Tasks:**
1. Set up Supabase Auth with email/password
2. Create admin login page
3. Build protected admin layout with auth check
4. Create PlayerForm component with validation
5. Create EpisodeForm component with validation
6. Create ResultsEntryForm for recording episode results
7. Build admin dashboard with quick actions
8. Implement edit/delete functionality
9. Add toast notifications for feedback

**Acceptance Criteria:**
- Admin can log in/out
- Admin can create/edit/delete players
- Admin can create/edit/delete episodes
- Admin can record episode results with multiple participants
- Validation prevents invalid data entry
- Feedback shown for all actions

### Phase 4: Public Stats Display (Days 9-13)

**Tasks:**
1. Build Homepage with overview stats and recent activity
2. Create PlayerList with search and sort
3. Create PlayerCard component
4. Build Player detail page with full stats and history
5. Create EpisodeList with filters
6. Create EpisodeCard component
7. Build Episode detail page with results
8. Create Leaderboard component with tabs
9. Build Leaderboards page with multiple ranking types
10. Add loading states and error handling throughout

**Acceptance Criteria:**
- All pages display correct data from database
- Search and filtering work correctly
- Sorting works on all sortable columns
- Player detail shows career stats + all appearances
- Episode detail shows all participant results
- Leaderboards rank correctly with proper tiebreakers
- Loading and error states display appropriately

### Phase 5: Advanced Features (Days 14-18)

**Tasks:**
1. Head-to-head comparison tool
2. Performance trend charts (using Recharts or similar)
3. Season-level aggregations and filtering
4. Fun records section (highest score ever, biggest comeback, streaks)
5. Search across players and episodes
6. Recent activity feed
7. Social sharing meta tags for player/episode pages

**Acceptance Criteria:**
- Can compare two players' head-to-head record
- Charts show meaningful performance data
- Can filter all views by season
- Records page shows interesting stats
- Global search works
- Pages have proper OG tags for sharing

### Phase 6: Polish & Launch (Days 19-21)

**Tasks:**
1. Responsive design review and fixes
2. Accessibility audit and improvements
3. Performance optimization (caching, ISR)
4. SEO optimization
5. Error boundary implementation
6. Final cross-browser testing
7. Documentation for data entry workflow
8. Production environment setup
9. Launch!

**Acceptance Criteria:**
- Works well on mobile, tablet, desktop
- Meets basic accessibility standards
- Pages load quickly
- No console errors
- Documentation complete

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started Commands

```bash
# Create Next.js project
npx create-next-app@latest beopardy-stats --typescript --tailwind --eslint --app --src-dir

# Install dependencies
cd beopardy-stats
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query  # For client-side data fetching
npm install lucide-react           # Icons
npm install date-fns               # Date formatting
npm install recharts               # Charts (Phase 5)
npm install react-hot-toast        # Toast notifications
npm install zod                    # Validation

# Generate Supabase types (after schema is set up)
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

---

## Notes for Development

1. **Server Components First**: Use React Server Components for data fetching where possible. Only use client components for interactivity.

2. **Error Handling**: Every data fetch should have proper error handling and display user-friendly messages.

3. **Loading States**: Use skeleton loaders that match the shape of the content being loaded.

4. **Accessibility**: Use semantic HTML, proper ARIA labels, keyboard navigation support.

5. **Mobile-First**: Design for mobile first, then enhance for larger screens.

6. **Consistent Spacing**: Use Tailwind spacing scale consistently (4, 6, 8 for small, medium, large).

7. **Color Usage Guidelines**:
   - Terracotta: Primary buttons, winner badges, key highlights
   - Dusty Rose: Secondary actions, hover states, tags
   - Golden: Achievements, records, special callouts
   - Cream: Section backgrounds, dividers, subtle emphasis

8. **Data Integrity**: Always validate data on both client and server. Use Zod schemas.

9. **Incremental Static Regeneration**: Use ISR for player and episode pages to balance freshness with performance.

10. **Testing Data Entry**: Before building public pages, ensure admin data entry flow is solid.
