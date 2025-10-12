# PRD: Video Generation Mode

## Product Overview

**Product Name:** Autogen Design - Video Generation Mode  
**Version:** 1.0  
**Target Release:** Q1 2025  
**Owner:** Product Team  
**Status:** Planning

## Executive Summary

The Video Generation Mode transforms Autogen Design from a static image generator into a comprehensive video creation platform. Users will be able to generate short-form videos, animations, and motion graphics from text prompts using state-of-the-art AI models.

## Problem Statement

### Current Pain Points
1. Users need separate tools for static images and video content
2. Creating animated content requires expensive software and expertise
3. Social media demands both image and video formats
4. No unified workflow for multi-format content creation
5. Video generation tools lack the polish and UX of Autogen Design

### User Needs
- Generate videos from text prompts (5-10 seconds)
- Convert static images to animated sequences
- Create social media clips (TikTok, Instagram Reels, YouTube Shorts)
- Produce motion graphics for presentations
- Animate logos and brand elements
- Generate explainer video segments

## Target Users

### Primary Personas

**1. Social Media Manager (Sarah, 28)**
- Creates 15-20 posts per week across platforms
- Needs quick turnaround for trending content
- Budget: $200/month for tools
- Pain: Video creation takes 2-3 hours per piece
- Goal: Reduce production time to 15 minutes

**2. Content Creator (Marcus, 32)**
- YouTube channel with 150K subscribers
- Produces educational content
- Needs B-roll and animated segments
- Pain: Stock video feels generic
- Goal: Custom animated segments that match brand

**3. Startup Founder (Lisa, 35)**
- Creating pitch deck presentations
- Limited design budget
- Needs product demo animations
- Pain: Can't afford motion designer
- Goal: Professional animations for investor meetings

**4. Marketing Agency (Team of 12)**
- Manages 30+ client accounts
- Produces video ads at scale
- Needs consistent brand adherence
- Pain: Outsourcing delays and cost
- Goal: In-house video generation capability

## Goals & Success Metrics

### Primary Goals
1. **Adoption:** 40% of existing users try video mode in first month
2. **Engagement:** Average 3 videos generated per active user per week
3. **Retention:** 60% of video users return within 7 days
4. **Quality:** 4.2+ star average rating on generated videos
5. **Performance:** 95% of videos render in under 60 seconds

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Video Generations | 10,000/month | Analytics dashboard |
| User Satisfaction | 4.5/5 stars | In-app rating |
| Render Success Rate | 98% | Error logs |
| Average Render Time | <45 seconds | Performance metrics |
| Export Completion | 85% | Funnel analysis |

## Feature Requirements

### Must-Have (V1)

#### 1. Text-to-Video Generation
**User Story:** As a content creator, I want to generate short videos from text prompts so that I can quickly produce social media content.

**Acceptance Criteria:**
- [ ] Support prompts 10-500 characters
- [ ] Generate 3-10 second videos
- [ ] Output in MP4 format (H.264 or HEVC codec)
- [ ] Minimum 720p resolution
- [ ] Frame rate: 24fps or 30fps
- [ ] Real-time progress indicator
- [ ] Preview before download

**Technical Specifications:**
```typescript
interface VideoGenerationRequest {
  prompt: string;
  duration: number; // seconds (3-10)
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  frameRate: 24 | 30 | 60;
  resolution: "720p" | "1080p" | "4k";
  style: "realistic" | "cartoon" | "anime" | "motion-graphics" | "3d";
  motion: "low" | "medium" | "high"; // camera/subject movement
  seed?: number; // for reproducibility
}

interface VideoGenerationResponse {
  id: string;
  status: "queued" | "processing" | "encoding" | "completed" | "failed";
  progress: number; // 0-100
  videoUrl?: string; // CDN URL when completed
  thumbnailUrl?: string;
  duration: number;
  fileSize: number; // bytes
  metadata: {
    width: number;
    height: number;
    frameRate: number;
    codec: string;
    bitrate: number;
  };
}
```

#### 2. Duration Control
**User Story:** As a social media manager, I want to specify exact video length so that content fits platform requirements.

**Acceptance Criteria:**
- [ ] Slider control: 3-10 seconds (V1), 3-30 seconds (V2)
- [ ] Preset buttons: 5s, 7s, 10s
- [ ] Display estimated render time
- [ ] Show file size estimate
- [ ] Platform-specific presets (TikTok: 9s, Reels: 7s, Shorts: 8s)

**UI/UX:**
```tsx
<div className="duration-control">
  <label>Duration</label>
  <input 
    type="range" 
    min={3} 
    max={10} 
    step={1}
    value={duration}
    onChange={handleDurationChange}
  />
  <span>{duration}s</span>
  
  {/* Quick presets */}
  <div className="presets">
    <button onClick={() => setDuration(5)}>TikTok (5s)</button>
    <button onClick={() => setDuration(7)}>Reels (7s)</button>
    <button onClick={() => setDuration(10)}>Shorts (10s)</button>
  </div>
  
  {/* Estimates */}
  <div className="estimates">
    <span>Est. render: ~{estimateRenderTime(duration)}s</span>
    <span>File size: ~{estimateFileSize(duration)}MB</span>
  </div>
</div>
```

#### 3. Frame Rate Selection
**User Story:** As a filmmaker, I want to control frame rate so that I can match my production standards.

**Acceptance Criteria:**
- [ ] Options: 24fps (cinematic), 30fps (standard), 60fps (smooth)
- [ ] Default: 30fps
- [ ] Display quality/file size trade-offs
- [ ] Lock 60fps behind Pro tier
- [ ] Show example previews for each frame rate

#### 4. Animation Style Presets
**User Story:** As a user, I want to quickly select animation styles so that I don't need to describe technical details.

**Styles:**
1. **Realistic**
   - Photorealistic rendering
   - Natural motion physics
   - Best for: Product demos, nature scenes
   - Example: "Ocean waves at sunset"

2. **Cartoon**
   - Bold outlines, vibrant colors
   - Exaggerated motion
   - Best for: Explainers, kids content
   - Example: "Happy character jumping"

3. **Anime**
   - Japanese animation aesthetic
   - Dramatic camera angles
   - Best for: Storytelling, action
   - Example: "Samurai drawing sword"

4. **Motion Graphics**
   - Clean, geometric shapes
   - Smooth transitions
   - Best for: Infographics, logos
   - Example: "Data visualization growing"

5. **3D Rendered**
   - Depth and dimensionality
   - Cinematic lighting
   - Best for: Architecture, products
   - Example: "Rotating product showcase"

**UI Implementation:**
```tsx
<div className="style-selector">
  {ANIMATION_STYLES.map(style => (
    <button
      key={style.id}
      className={cn("style-card", selected === style.id && "selected")}
      onClick={() => setStyle(style.id)}
    >
      <img src={style.thumbnail} alt={style.name} />
      <h4>{style.name}</h4>
      <p>{style.description}</p>
      <span className="badge">{style.bestFor}</span>
    </button>
  ))}
</div>
```

#### 5. Aspect Ratio Presets
**User Story:** As a multi-platform creator, I want platform-specific aspect ratios so that my videos display correctly.

**Presets:**
- **16:9** (1920×1080) - YouTube, Desktop
- **9:16** (1080×1920) - TikTok, Reels, Shorts
- **1:1** (1080×1080) - Instagram Feed, Facebook
- **4:5** (1080×1350) - Instagram Portrait

**Acceptance Criteria:**
- [ ] Radio button selection
- [ ] Show platform icons for each ratio
- [ ] Auto-adjust composition for vertical/horizontal
- [ ] Preview frame with safe zones
- [ ] Remember last selection per user

#### 6. Progress Tracking & Preview
**User Story:** As a user, I want to see generation progress so that I know when my video will be ready.

**Stages:**
1. **Queued** (0-5%) - Waiting for GPU slot
2. **Initializing** (5-15%) - Loading model weights
3. **Generating Frames** (15-80%) - AI creating frames
4. **Encoding** (80-95%) - Converting to MP4
5. **Uploading** (95-100%) - Saving to storage
6. **Completed** (100%) - Ready for download

**UI Components:**
```tsx
<div className="generation-progress">
  <div className="progress-bar">
    <div className="fill" style={{ width: `${progress}%` }} />
  </div>
  
  <div className="stage-info">
    <span className="stage">{currentStage}</span>
    <span className="percent">{progress}%</span>
  </div>
  
  {progress > 15 && progress < 80 && (
    <div className="frame-preview">
      <img src={latestFrameUrl} alt="Current frame" />
      <span>Frame {currentFrame} / {totalFrames}</span>
    </div>
  )}
  
  <div className="time-estimate">
    Estimated time remaining: {estimateTimeRemaining()}
  </div>
</div>
```

#### 7. Video Player & Controls
**User Story:** As a user, I want to preview my video before downloading so that I can verify quality.

**Features:**
- [ ] Inline video player (HTML5)
- [ ] Play/pause controls
- [ ] Scrubbing timeline
- [ ] Volume control
- [ ] Loop toggle
- [ ] Fullscreen mode
- [ ] Download button
- [ ] Share button (copy link)
- [ ] Regenerate with same settings

**Player Component:**
```tsx
<div className="video-player">
  <video
    ref={videoRef}
    src={videoUrl}
    poster={thumbnailUrl}
    controls
    loop={loopEnabled}
    onTimeUpdate={handleTimeUpdate}
    onLoadedMetadata={handleMetadataLoaded}
  />
  
  <div className="video-controls">
    <button onClick={togglePlay}>
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
    
    <input
      type="range"
      min={0}
      max={duration}
      value={currentTime}
      onChange={handleSeek}
    />
    
    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
    
    <button onClick={toggleLoop}>
      <LoopIcon className={loopEnabled ? "active" : ""} />
    </button>
    
    <button onClick={toggleFullscreen}>
      <FullscreenIcon />
    </button>
  </div>
  
  <div className="video-actions">
    <button onClick={handleDownload} className="primary">
      <DownloadIcon /> Download MP4
    </button>
    <button onClick={handleRegenerate}>
      <RefreshIcon /> Regenerate
    </button>
    <button onClick={handleShare}>
      <ShareIcon /> Share
    </button>
  </div>
</div>
```

### Should-Have (V2)

#### 8. Image-to-Video
- Upload static image
- Animate with camera motion (pan, zoom, rotate)
- Add motion to specific elements
- Generate loop animations

#### 9. Music & Sound Effects
- Auto-generated background music
- Sound effect library
- Sync audio to visual beats
- Volume normalization

#### 10. Text Overlays
- Add animated text layers
- Font selection
- Timing and positioning
- Entrance/exit animations

#### 11. Batch Generation
- Generate multiple variations
- Queue management
- Bulk download
- Comparison view

### Nice-to-Have (V3)

#### 12. Video Editing
- Trim/cut clips
- Combine multiple generations
- Transition effects
- Speed controls (slow-mo, time-lapse)

#### 13. Brand Consistency
- Save brand presets (colors, style)
- Logo watermarking
- Consistent motion language
- Template system

#### 14. Advanced Controls
- Camera path specification
- Keyframe control
- Lighting adjustments
- Depth of field

## API Integration

### Recommended Providers

#### Option 1: Runway Gen-3 (Recommended for V1)
**Pros:**
- State-of-the-art quality
- 5-10 second videos
- Text-to-video and image-to-video
- Good motion consistency
- API-first design

**Cons:**
- Higher cost ($0.05/second)
- Limited customization
- Queue times during peak

**Integration (GenAIScript first-class):**

Use GenAIScript to orchestrate provider calls, retries, and polling. Example GenAIScript workflow for Runway Gen-3:

```genaiscript
provider "runway" {
  api_key = env("RUNWAY_API_KEY")
}

workflow "generate_video" {
  input {
    prompt: string
    duration: int
    aspect_ratio: string
    frame_rate: int
    style: string
  }

  step "create_job" using provider.runway.create {
    prompt = input.prompt
    duration = input.duration
    ratio = input.aspect_ratio
    fps = input.frame_rate
    style = input.style
  }

  step "poll_job" using provider.runway.poll {
    job_id = create_job.id
    retry { attempts = 10; backoff = "exponential" }
  }

  output {
    video_url = poll_job.output.video_url
    thumbnail = poll_job.output.thumbnail
  }
}
```

#### Option 2: Pika Labs
**Pros:**
- Excellent animation quality
- Style variety (anime, cartoon, realistic)
- Image-to-video strong
- Competitive pricing

**Cons:**
- Newer API (less stable)
- Limited documentation
- Beta access required

#### Option 3: Stable Video Diffusion (Open Source)
**Pros:**
- Free (self-hosted)
- Full customization
- No API limits
- Privacy control

**Cons:**
- Requires GPU infrastructure
- More development work
- Quality not as high
- Slower generation

### Hybrid Approach (Recommended)
1. **Primary:** Runway Gen-3 for paid tiers
2. **Fallback:** Pika Labs during Runway outages
3. **Free Tier:** Stable Video Diffusion (limited to 5s, lower quality)

## Database Schema

```prisma
model VideoGeneration {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  
  // Input parameters
  prompt            String
  duration          Int      // seconds
  aspectRatio       String   // "16:9", "9:16", etc.
  frameRate         Int      // 24, 30, 60
  resolution        String   // "720p", "1080p", "4k"
  style             String   // "realistic", "cartoon", etc.
  motionIntensity   String   // "low", "medium", "high"
  seed              Int?
  
  // Generation metadata
  provider          String   // "runway", "pika", "stable-video"
  providerJobId     String?
  status            String   // "queued", "processing", "completed", "failed"
  progress          Int      @default(0)
  currentStage      String?
  
  // Output metadata
  videoUrl          String?
  thumbnailUrl      String?
  width             Int?
  height            Int?
  codec             String?
  bitrate           Int?
  fileSize          Int?     // bytes
  
  // Timestamps
  createdAt         DateTime @default(now())
  startedAt         DateTime?
  completedAt       DateTime?
  
  // Analytics
  downloads         Int      @default(0)
  shares            Int      @default(0)
  rating            Float?
  
  // Cost tracking
  creditsUsed       Int
  renderTimeMs      Int?
  
  @@index([userId, createdAt])
  @@index([status])
}
```

## UI/UX Design

### Video Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Mode Tabs: [Images] [Video*] [Synthetic] [Brand] [Eng]     │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────┬─────────────────────────────────────┐
│ CONTROLS (Left)       │ PREVIEW/GALLERY (Right)             │
├───────────────────────┼─────────────────────────────────────┤
│                       │                                     │
│ [Prompt Textarea]     │  ┌─────────────────────────────┐   │
│                       │  │                             │   │
│ Duration: [====|==] 7s│  │    VIDEO PLAYER             │   │
│  └─ Presets: TikTok   │  │    (16:9 preview)           │   │
│     Reels Shorts      │  │                             │   │
│                       │  │    [Play Button]            │   │
│ Frame Rate:           │  │                             │   │
│  ( ) 24fps (●) 30fps  │  └─────────────────────────────┘   │
│  ( ) 60fps (Pro)      │                                     │
│                       │  Progress: ████████░░ 80%           │
│ Aspect Ratio:         │  Stage: Encoding video...           │
│  ( ) 16:9 (●) 9:16    │  Est. time: 12s                     │
│  ( ) 1:1  ( ) 4:5     │                                     │
│                       │  [Download] [Regenerate] [Share]    │
│ Style:                │                                     │
│  ┌─────┬─────┬─────┐ │  ─────────────────────────────────  │
│  │Real │Cart│Anime│ │                                     │
│  └─────┴─────┴─────┘ │  RECENT VIDEOS                      │
│  ┌─────┬─────┐       │  ┌────┬────┬────┬────┐             │
│  │Moti│ 3D  │       │  │ [] │ [] │ [] │ [] │             │
│  └─────┴─────┘       │  └────┴────┴────┴────┘             │
│                       │  ┌────┬────┬────┬────┐             │
│ Resolution:           │  │ [] │ [] │ [] │ [] │             │
│  (●) 720p ( ) 1080p  │  └────┴────┴────┴────┘             │
│  ( ) 4K (Pro)         │                                     │
│                       │                                     │
│ [Generate Video]      │                                     │
│  └─ Cost: 3 credits   │                                     │
│                       │                                     │
└───────────────────────┴─────────────────────────────────────┘
```

### Mobile Layout (Stacked)

```
┌─────────────────────────┐
│ Mode: [Video ▼]         │
├─────────────────────────┤
│                         │
│ [Prompt Textarea]       │
│                         │
│ Duration: 7s            │
│ [========|==]           │
│ Quick: TikTok Reels     │
│                         │
│ Frame Rate: 30fps ▼     │
│ Aspect: 9:16 ▼          │
│ Style: Realistic ▼      │
│                         │
│ [Generate Video]        │
│                         │
├─────────────────────────┤
│   VIDEO PREVIEW         │
│  ┌─────────────────┐    │
│  │                 │    │
│  │  [Play]         │    │
│  │                 │    │
│  └─────────────────┘    │
│  Progress: 80%          │
│  [Download] [Share]     │
├─────────────────────────┤
│ RECENT                  │
│ ┌───┬───┬───┐           │
│ │ □ │ □ │ □ │           │
│ └───┴───┴───┘           │
└─────────────────────────┘
```

## Cost & Credit System

### Credit Pricing

| Duration | Resolution | Frame Rate | Credits | Est. Cost |
|----------|-----------|-----------|---------|-----------|
| 3s       | 720p      | 24fps     | 2       | $0.20     |
| 5s       | 720p      | 30fps     | 3       | $0.30     |
| 7s       | 1080p     | 30fps     | 5       | $0.50     |
| 10s      | 1080p     | 30fps     | 7       | $0.70     |
| 10s      | 1080p     | 60fps     | 12      | $1.20     |
| 10s      | 4K        | 30fps     | 15      | $1.50     |

### Free Tier Limits
- 2 videos per day
- Max 5 seconds
- 720p only
- 24fps only
- Watermarked
- No priority queue

### Pro Tier ($29/month)
- 100 videos per month
- Up to 10 seconds
- 4K resolution
- 60fps
- No watermark
- Priority queue
- Batch generation

### Enterprise (Custom)
- Unlimited videos
- API access
- White-label
- Custom models
- Dedicated support

## Performance Requirements

### Generation Speed
- **Target:** 90% of videos complete in <60 seconds
- **Maximum:** No video should take >5 minutes
- **Queue:** Max wait time 30 seconds during peak

### Quality Metrics
- **Resolution:** Minimum 720p, target 1080p
- **Frame Rate:** Consistent (no dropped frames)
- **Compression:** Balanced (quality vs. file size)
- **Audio:** 128kbps AAC (when audio supported)

### Reliability
- **Uptime:** 99.5% SLA
- **Error Rate:** <2% of generations
- **Retry:** Auto-retry failed generations once
- **Rollback:** Fallback to backup provider if primary fails

## Security & Compliance

### Content Moderation
- Pre-generation prompt filtering (block NSFW, violence, hate)
- Post-generation video scanning (Azure Content Safety)
- User reporting system
- Automated takedown for violations
- Appeal process

### Data Privacy
- Videos stored encrypted (AES-256)
- User data GDPR compliant
- Optional video expiration (auto-delete after 30 days)
- Download tracking (who accessed what)
- Right to deletion

### API Security
- Rate limiting per user/IP
- API key rotation
- Request signing
- CORS restrictions
- DDoS protection

## Analytics & Monitoring

### User Metrics
- Videos generated per user per day/week/month
- Average duration selected
- Most popular styles
- Aspect ratio distribution
- Frame rate preferences
- Completion rate (started vs. downloaded)

### System Metrics
- Average render time by duration/resolution
- Queue depth and wait times
- Provider uptime and failure rates
- Cost per video by provider
- Storage usage growth
- CDN bandwidth consumption

### Business Metrics
- Credits consumed per day
- Revenue per video generation
- Conversion rate (free → pro)
- Churn rate
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

## Launch Plan

### Phase 1: Alpha (Week 1-2)
- Internal testing with 10 team members
- Basic text-to-video only
- Limited to 5s, 720p, 24fps
- Single provider (Runway)
- Bug fixes and UX improvements

### Phase 2: Beta (Week 3-4)
- Invite 100 power users
- All durations and resolutions
- Multiple styles
- Gather feedback
- Performance tuning

### Phase 3: Limited Release (Week 5-6)
- Open to Pro tier users
- Marketing campaign
- Documentation and tutorials
- Monitor costs and usage
- Scale infrastructure

### Phase 4: General Availability (Week 7+)
- Open to all users
- Free tier launch
- Press release
- Influencer partnerships
- Continuous improvement

## Open Questions & Risks

### Questions
1. Which video provider offers best quality/cost ratio?
2. How do we handle NSFW content in videos?
3. What's acceptable queue time during peak hours?
4. Should we support custom aspect ratios?
5. How do we prevent abuse (e.g., generating 1000 videos)?

### Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Provider API downtime | Medium | High | Multi-provider fallback |
| Generation costs exceed budget | High | High | Credit limits, tiered pricing |
| Low adoption rate | Medium | High | Marketing, free tier, tutorials |
| Quality below expectations | Low | High | Extensive testing, provider comparison |
| Storage costs spiral | Medium | Medium | Auto-deletion, compression, CDN optimization |

## Success Criteria

**Launch is successful if:**
1. ✅ 25% of active users try video mode in first month
2. ✅ 4.0+ star average rating
3. ✅ 95%+ render success rate
4. ✅ <60s average render time
5. ✅ Positive unit economics (revenue > costs)

**Post-launch (3 months):**
1. ✅ 50% of Pro users generate videos weekly
2. ✅ 10,000+ videos generated monthly
3. ✅ 20%+ conversion from free to Pro via video
4. ✅ <5% churn attributed to video issues
5. ✅ Feature in top 3 most used modes

## Appendix

### Example Prompts

**Good Prompts:**
- "Ocean waves crashing on a rocky shore at sunset, cinematic"
- "Animated logo reveal with particles, motion graphics style"
- "Cat playing with yarn ball, cartoon style, playful movement"
- "Product rotating 360 degrees on pedestal, 3D rendered"
- "Time-lapse of flower blooming, realistic, soft lighting"

**Bad Prompts:**
- "Video" (too vague)
- "Make it look good" (no details)
- "NSFW content" (violates policy)
- "50-page essay" (not visual)

### Competitive Analysis

| Feature | Autogen Video | Runway | Pika | Synthesia |
|---------|---------------|--------|------|-----------|
| Text-to-Video | ✅ | ✅ | ✅ | ❌ |
| Image-to-Video | V2 | ✅ | ✅ | ❌ |
| Duration | 3-10s | 5s | 3s | Unlimited |
| Styles | 5 | Limited | Many | 1 |
| Pricing | $0.30/5s | $0.05/s | $1/video | $30/month |
| Quality | High | Highest | High | Medium |
| Ease of Use | Excellent | Good | Good | Excellent |

### References
- [Runway Gen-3 Docs](https://docs.runwayml.com/)
- [Pika API Beta](https://pika.art/api)
- [Stable Video Diffusion Paper](https://stability.ai/research/stable-video-diffusion)
- [TikTok Video Specs](https://www.tiktok.com/creators/creator-portal/en-us/video-creation/video-specs/)

---

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Next Review:** Weekly during development
