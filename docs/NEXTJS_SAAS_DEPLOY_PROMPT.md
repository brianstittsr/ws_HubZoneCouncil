# Next.js SaaS AI Tools Suite - Product Rebuild Prompt

## Project Overview

Rebuild the existing Flask-based AI Media Suite as a modern, production-ready Next.js application with purchasable SaaS tools. Each tool should be individually purchasable or available as part of subscription tiers.

---

## Current Features to Rebuild

### 1. 🎵 Audio Transcription Tool
**Description:** Convert audio/video files to accurate text transcripts with timestamps

**Current Capabilities:**
- File upload support (MP3, WAV, M4A, FLAC, OGG, MP4)
- Video URL transcription (YouTube, Vimeo, Twitter/X, 1000+ platforms via yt-dlp)
- Large file chunking (handles files >20MB by splitting)
- Timestamped transcript output
- Background processing with real-time progress updates
- Powered by OpenAI Whisper API

**Pricing Model:** $0.10/minute of audio

**Next.js Implementation Requirements:**
- Server Actions for file processing
- Edge-compatible streaming for progress updates
- Vercel Blob or S3 for temporary file storage
- Queue system (Inngest/Trigger.dev) for background processing
- WebSocket or Server-Sent Events for real-time status

---

### 2. 🗣️ Text-to-Speech Tool
**Description:** Transform text into natural-sounding audio

**Current Capabilities:**
- 6 unique voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Voice preview functionality
- Text file upload support (.txt)
- High-quality MP3 output
- Powered by OpenAI TTS API

**Pricing Model:** $0.05/1000 characters

**Next.js Implementation Requirements:**
- Streaming audio response
- Client-side audio player with download
- Character count tracking for billing
- Voice sample caching

---

### 3. 🖼️ Image Generation Tool
**Description:** Create images from text descriptions using AI

**Current Capabilities:**
- Text prompt to image generation
- High resolution output (1024x1024)
- Instant generation
- Download capability
- Powered by DALL-E 3

**Pricing Model:** $0.04/image

**Next.js Implementation Requirements:**
- Image optimization with Next/Image
- Generated image storage (Cloudinary/S3)
- Prompt history for users
- Image gallery for past generations

---

### 4. 🤖 AI Chat Tool
**Description:** Intelligent conversational AI assistant

**Current Capabilities:**
- Natural language conversations
- Context-aware responses (conversation history)
- Multi-turn dialogue support
- Instant responses
- Powered by GPT-3.5-Turbo

**Pricing Model:** $0.002/1000 tokens

**Next.js Implementation Requirements:**
- Streaming responses with AI SDK
- Conversation persistence (database)
- Token counting and usage tracking
- Chat history management

---

### 5. 🌐 Spanish Translator Tool
**Description:** Real-time Spanish to English audio translation

**Current Capabilities:**
- Real-time audio translation
- Text display mode
- Voice playback mode (translated audio)
- High accuracy translation
- Powered by Whisper + GPT

**Pricing Model:** $0.15/minute

**Next.js Implementation Requirements:**
- WebRTC for audio capture
- Real-time transcription streaming
- Dual output (text + synthesized audio)
- Language detection

---

### 6. 📸 AI Headshot Generator Tool
**Description:** Transform photos into professional AI-generated headshots

**Current Capabilities:**
- 6 professional styles
- High resolution output
- Photo upload and processing
- Instant generation
- AI-enhanced quality

**Pricing Model:** $0.08/headshot

**Next.js Implementation Requirements:**
- Image upload with preview
- Style selection UI
- Before/after comparison
- Batch processing option

---

### 7. 🔎 Web Crawler (Crawl4AI) Tool
**Description:** Crawl websites and extract information with AI

**Current Capabilities:**
- URL-based crawling
- AI-powered content extraction
- JavaScript rendering support (Selenium)
- Structured data output

**Pricing Model:** $0.02/page crawled

**Next.js Implementation Requirements:**
- Headless browser integration
- Rate limiting and queue management
- Structured output formats (JSON, CSV)
- Crawl depth configuration

---

## Technical Architecture

### Frontend Stack
```
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Framer Motion (animations)
- React Query / SWR (data fetching)
```

### Backend Stack
```
- Next.js API Routes / Server Actions
- Vercel AI SDK (for streaming)
- Prisma ORM
- PostgreSQL (Supabase/Neon)
- Redis (Upstash) for caching/queues
- Inngest/Trigger.dev for background jobs
```

### Authentication & Payments
```
- NextAuth.js / Clerk (authentication)
- Stripe (payments & subscriptions)
- Usage-based billing tracking
```

### Storage & CDN
```
- Vercel Blob / AWS S3 (file storage)
- Cloudinary (image optimization)
- Cloudflare CDN
```

---

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Subscription
  stripeCustomerId     String?   @unique
  subscriptionId       String?
  subscriptionStatus   String?
  subscriptionTier     String?   @default("free")
  
  // Usage tracking
  credits       Int       @default(0)
  usageRecords  UsageRecord[]
  
  // Tool access
  purchasedTools PurchasedTool[]
  
  // Content
  transcriptions Transcription[]
  generations    Generation[]
  conversations  Conversation[]
}

model PurchasedTool {
  id        String   @id @default(cuid())
  userId    String
  toolId    String
  purchasedAt DateTime @default(now())
  expiresAt DateTime?
  
  user      User     @relation(fields: [userId], references: [id])
  tool      Tool     @relation(fields: [toolId], references: [id])
}

model Tool {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  price       Float    // One-time purchase price
  monthlyPrice Float?  // Subscription price
  features    Json
  isActive    Boolean  @default(true)
  
  purchases   PurchasedTool[]
}

model UsageRecord {
  id        String   @id @default(cuid())
  userId    String
  toolSlug  String
  units     Float    // minutes, characters, images, etc.
  cost      Float
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}

model Transcription {
  id          String   @id @default(cuid())
  userId      String
  filename    String?
  sourceUrl   String?
  duration    Float?
  status      String   @default("pending")
  transcript  String?  @db.Text
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}

model Generation {
  id          String   @id @default(cuid())
  userId      String
  type        String   // "image", "audio", "headshot"
  prompt      String?
  inputUrl    String?
  outputUrl   String?
  metadata    Json?
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}

model Conversation {
  id          String   @id @default(cuid())
  userId      String
  title       String?
  messages    Json
  tokenCount  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Pricing & Subscription Tiers

### Individual Tool Purchase
Each tool can be purchased separately for lifetime access:
- Audio Transcription: $29
- Text-to-Speech: $19
- Image Generation: $24
- AI Chat: $14
- Spanish Translator: $34
- Headshot Generator: $19
- Web Crawler: $24

### Subscription Tiers

#### Free Tier
- Limited access to all tools
- 10 minutes transcription/month
- 5,000 TTS characters/month
- 5 images/month
- 50 chat messages/month
- Watermarked outputs

#### Pro Tier - $19/month
- Full access to all tools
- 120 minutes transcription/month
- 100,000 TTS characters/month
- 100 images/month
- Unlimited chat
- No watermarks
- Priority processing

#### Business Tier - $49/month
- Everything in Pro
- 500 minutes transcription/month
- 500,000 TTS characters/month
- 500 images/month
- API access
- Team collaboration (5 seats)
- Custom branding
- Priority support

#### Enterprise - Custom
- Unlimited usage
- Dedicated infrastructure
- Custom integrations
- SLA guarantee
- Dedicated support

---

## Project Structure

```
/app
  /(marketing)
    /page.tsx                 # Landing page
    /pricing/page.tsx         # Pricing page
    /features/page.tsx        # Features overview
  /(dashboard)
    /layout.tsx               # Dashboard layout with sidebar
    /dashboard/page.tsx       # User dashboard
    /tools
      /transcription/page.tsx
      /text-to-speech/page.tsx
      /image-generation/page.tsx
      /chat/page.tsx
      /translator/page.tsx
      /headshot/page.tsx
      /crawler/page.tsx
    /history/page.tsx         # Usage history
    /settings/page.tsx        # Account settings
    /billing/page.tsx         # Billing & subscription
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /api
    /webhooks/stripe/route.ts
    /transcribe/route.ts
    /tts/route.ts
    /generate-image/route.ts
    /chat/route.ts
    /translate/route.ts
    /headshot/route.ts
    /crawl/route.ts
/components
  /ui                         # shadcn components
  /tools                      # Tool-specific components
  /dashboard                  # Dashboard components
  /marketing                  # Landing page components
/lib
  /openai.ts                  # OpenAI client
  /stripe.ts                  # Stripe client
  /db.ts                      # Prisma client
  /auth.ts                    # Auth configuration
  /utils.ts                   # Utility functions
/hooks
  /use-usage.ts               # Usage tracking hook
  /use-subscription.ts        # Subscription status hook
```

---

## Key Features to Implement

### 1. Usage-Based Billing
- Track usage per tool in real-time
- Deduct from user credits or subscription allowance
- Overage billing for subscription users
- Usage dashboard with charts

### 2. Real-Time Progress Updates
- Server-Sent Events for long-running tasks
- Progress bars with detailed status messages
- Cancellation support
- Error recovery

### 3. File Management
- Secure file upload with size limits
- Automatic cleanup of temporary files
- Download links with expiration
- File history for users

### 4. API Access (Business Tier)
- API key generation and management
- Rate limiting per tier
- Usage tracking via API
- Webhook notifications

### 5. Admin Dashboard
- User management
- Usage analytics
- Revenue tracking
- Tool configuration

---

## Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup with TypeScript
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] Database schema and Prisma setup
- [ ] Authentication (NextAuth/Clerk)
- [ ] Basic layout and navigation

### Phase 2: Core Tools (Week 3-5)
- [ ] Audio Transcription tool
- [ ] Text-to-Speech tool
- [ ] Image Generation tool
- [ ] AI Chat tool
- [ ] Real-time progress updates

### Phase 3: Advanced Tools (Week 6-7)
- [ ] Spanish Translator tool
- [ ] Headshot Generator tool
- [ ] Web Crawler tool
- [ ] Video URL transcription

### Phase 4: Monetization (Week 8-9)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Individual tool purchases
- [ ] Usage tracking and billing
- [ ] Credits system

### Phase 5: Polish & Launch (Week 10-12)
- [ ] Landing page design
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] Documentation
- [ ] Deployment to Vercel

---

## UI/UX Requirements

### Design System
- Modern, clean aesthetic
- Purple/violet gradient theme (matching current: #667eea → #764ba2)
- Card-based layouts
- Smooth animations and transitions
- Mobile-responsive design
- Dark mode support

### Key UI Components
- Tool cards with feature lists
- Progress indicators with status messages
- File upload dropzones
- Audio/video players
- Image galleries
- Chat interfaces
- Pricing tables
- Usage dashboards

---

## Success Metrics

- Page load time < 2 seconds
- Tool response time < 5 seconds (for quick operations)
- 99.9% uptime
- Mobile Lighthouse score > 90
- Conversion rate tracking
- User retention metrics

---

## Notes for Implementation

1. **Streaming is Critical**: Use Vercel AI SDK for streaming responses in chat and TTS
2. **Background Jobs**: Use Inngest or Trigger.dev for long-running transcription tasks
3. **Rate Limiting**: Implement per-user rate limits to prevent abuse
4. **Error Handling**: Graceful degradation with user-friendly error messages
5. **Caching**: Cache voice samples, frequently used prompts, and static assets
6. **Security**: Validate all inputs, sanitize outputs, secure file uploads
7. **Accessibility**: WCAG 2.1 AA compliance for all tools

---

## Getting Started Command

```bash
npx create-next-app@latest ai-media-suite --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd ai-media-suite
npx shadcn-ui@latest init
npm install @prisma/client prisma @auth/prisma-adapter next-auth stripe @stripe/stripe-js openai ai @vercel/blob
npx prisma init
```

---

This prompt provides a complete blueprint for rebuilding the AI Media Suite as a modern, monetizable Next.js SaaS application with individual tool purchases and subscription tiers.
