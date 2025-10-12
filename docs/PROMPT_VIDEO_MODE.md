# Implementation Prompt: Video Generation Mode

## Context

You are implementing the Video Generation Mode for Autogen Design, a Next.js-based AI content generation platform. This mode allows users to generate short-form videos (3-10 seconds) from text prompts using AI models like Runway Gen-3, Pika Labs, or Stable Video Diffusion.

## Your Task

Build a complete, production-ready Video Generation Mode that integrates seamlessly with the existing Autogen Design platform. The implementation should match the quality and polish of the existing Image Generation mode.

## Technical Stack

**Framework:** Next.js 14.2.33 (App Router)  
**Language:** GenAIScript and TypeScript (strict mode)  
**Database:** SQLLite for dev, Prisma ORM with PostgreSQL  
**Storage:** Cloudflare R2 (primary) + Local fallback
**Authentication:** NextAuth.js  
**UI:** TailwindCSS + Radix UI + Preline  
**State:** React hooks (usePrediction pattern)

## Requirements

### 1. Core Functionality

**Video Generation Flow:**
1. User enters text prompt (10-500 characters)
2. Selects duration (3-10 seconds via slider)
3. Chooses frame rate (24fps, 30fps, 60fps)
4. Picks aspect ratio (16:9, 9:16, 1:1, 4:5)
5. Selects animation style (realistic, cartoon, anime, motion-graphics, 3d)
6. Clicks "Generate Video" button
7. Real-time progress tracking (queued → processing → encoding → completed)
8. Preview in inline video player
9. Download MP4 file

**Must implement:**
- Text-to-video generation via API
- Duration control (slider + presets)
- Frame rate selection (radio buttons)
- Aspect ratio presets (with platform icons)
- Animation style cards (with thumbnails)
- Progress tracking (0-100% with stage labels)
- Video player with play/pause, scrubbing, loop
- Download functionality
- Credit/cost calculation
- Error handling and retries

### 2. File Structure

Create these new files:

```
hooks/
  useVideoGeneration.ts          # Main generation hook (similar to usePrediction)
  
components/Generator/
  VideoControls.tsx               # Duration, framerate, aspect ratio controls
  VideoStyleSelector.tsx          # Animation style selection cards
  VideoPlayer.tsx                 # HTML5 video player with controls
  VideoProgressTracker.tsx        # Generation progress with stages
  VideoGallery.tsx                # Grid of recent video generations
  
app/api/video/
  generate/route.ts               # POST endpoint for video generation
  [id]/route.ts                   # GET endpoint for generation status
  [id]/download/route.ts          # GET endpoint for video download
  
models/
  videoGeneration.ts              # Prisma queries for video generations
  
services/
  videoProviders/
    runwayProvider.ts             # Runway Gen-3 integration
    pikaProvider.ts               # Pika Labs integration  
    stableVideoProvider.ts        # Stable Video Diffusion integration
  videoProvider.ts                # Unified provider interface
  
types/
  video.ts                        # TypeScript interfaces
```

### 3. Database Schema

Add to `prisma/schema.prisma`:

```prisma
model VideoGeneration {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Input parameters
  prompt            String
  duration          Int      // seconds (3-10)
  aspectRatio       String   // "16:9", "9:16", "1:1", "4:5"
  frameRate         Int      // 24, 30, 60
  resolution        String   // "720p", "1080p", "4k"
  style             String   // "realistic", "cartoon", "anime", "motion-graphics", "3d"
  motionIntensity   String   @default("medium") // "low", "medium", "high"
  seed              Int?
  
  // Generation metadata
  provider          String   // "runway", "pika", "stable-video"
  providerJobId     String?  @unique
  status            String   @default("queued") // "queued", "processing", "encoding", "completed", "failed"
  progress          Int      @default(0)
  currentStage      String?
  errorMessage      String?
  
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
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([status])
  @@index([providerJobId])
}

// Update User model
model User {
  // ... existing fields
  videoGenerations VideoGeneration[]
}
```

### 4. API Provider Integration

**Choose ONE provider for V1 implementation:**

**Option A: Runway Gen-3 (Recommended, GenAIScript orchestration)**
- High quality, reliable
- Text-to-video and image-to-video
- Cost: ~$0.05/second
- API: REST with polling

```genaiscript
// GenAIScript workflow for Runway Gen-3
provider "runway" {
  api_key = env("RUNWAY_API_KEY")
}

workflow "runway_video_generation" {
  input {
    prompt: string
    duration: int
    aspect_ratio: string
    frame_rate: int
    style: string
  }

  step "create" using provider.runway.create {
    prompt = input.prompt
    duration = input.duration
    ratio = input.aspect_ratio
    fps = input.frame_rate
    style = input.style
  }

  step "poll" using provider.runway.poll {
    job_id = create.id
    retry { attempts = 12; backoff = "exponential" }
  }

  output {
    video_url = poll.output.video_url
    thumbnail = poll.output.thumbnail
    status = poll.output.status
  }
}
```

**Option B: Stable Video Diffusion (Open Source)**
- Free but requires GPU infrastructure
- Lower quality than Runway
- Good for free tier

```typescript
// services/videoProviders/stableVideoProvider.ts
import { spawn } from 'child_process';

export async function generateVideo(params: VideoGenerationParams) {
  // Call Python script that runs Stable Video Diffusion
  const process = spawn('python', [
    'scripts/stable-video-diffusion.py',
    '--prompt', params.prompt,
    '--duration', params.duration.toString(),
    '--output', outputPath,
  ]);
  
  return {
    jobId: generateJobId(),
    processId: process.pid,
  };
}
```

### 5. Key Components

**A. useVideoGeneration Hook**

```typescript
// hooks/useVideoGeneration.ts
export function useVideoGeneration() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = async (params: VideoGenerationRequest) => {
    setGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Submit generation request
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const { jobId } = await response.json();

      // 2. Poll for progress
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/video/${jobId}`);
        const status = await statusRes.json();

        setProgress(status.progress);
        setCurrentStage(status.currentStage);

        if (status.status === 'completed') {
          clearInterval(pollInterval);
          setVideoUrl(status.videoUrl);
          setGenerating(false);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError(status.errorMessage);
          setGenerating(false);
        }
      }, 2000); // Poll every 2 seconds

    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  };

  return {
    generating,
    progress,
    currentStage,
    videoUrl,
    error,
    generateVideo,
  };
}
```

**B. Video Player Component**

```typescript
// components/Generator/VideoPlayer.tsx
export function VideoPlayer({ videoUrl, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="video-player-container">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        loop={isLooping}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        className="w-full rounded-lg"
      />
      
      <div className="video-controls mt-4 flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="flex-1"
        />

        <span className="text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <button
          onClick={() => setIsLooping(!isLooping)}
          className={cn(
            "p-2 rounded-full",
            isLooping ? "bg-primary/20" : "bg-white/10"
          )}
        >
          <LoopIcon />
        </button>
      </div>

      <div className="video-actions mt-4 flex gap-2">
        <button
          onClick={() => window.open(videoUrl, '_blank')}
          className="btn-primary"
        >
          <DownloadIcon className="mr-2" />
          Download MP4
        </button>
        <button className="btn-secondary">
          <ShareIcon className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}
```

**C. Progress Tracker**

```typescript
// components/Generator/VideoProgressTracker.tsx
const STAGES = {
  queued: { label: 'Queued', emoji: '⏳', range: [0, 5] },
  initializing: { label: 'Initializing', emoji: '🔄', range: [5, 15] },
  generating: { label: 'Generating Frames', emoji: '🎨', range: [15, 80] },
  encoding: { label: 'Encoding Video', emoji: '📹', range: [80, 95] },
  uploading: { label: 'Uploading', emoji: '☁️', range: [95, 100] },
  completed: { label: 'Completed', emoji: '✅', range: [100, 100] },
};

export function VideoProgressTracker({ progress, currentStage }: Props) {
  const stage = STAGES[currentStage] || STAGES.queued;

  return (
    <div className="progress-tracker rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {stage.emoji} {stage.label}
        </span>
        <span className="text-sm text-white/60">{progress}%</span>
      </div>

      <div className="progress-bar h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7b61ff] to-[#7bd7ff] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress > 15 && progress < 80 && (
        <div className="mt-4 text-xs text-white/50">
          Estimated time remaining: ~{estimateTimeRemaining(progress)}s
        </div>
      )}
    </div>
  );
}
```

### 6. Integration with Generation Mode Switcher

Update `components/Generator/ImageGenerator.tsx`:

```typescript
import VideoControls from './VideoControls';
import VideoPlayer from './VideoPlayer';
import VideoGallery from './VideoGallery';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';

// Inside ImageGenerator component:
const { generating, progress, currentStage, videoUrl, generateVideo } = useVideoGeneration();

// In the render:
{generationMode === 'video' && (
  <>
    <VideoControls
      onGenerate={handleVideoGenerate}
      disabled={generating || !hasCredits}
    />
    
    {generating && (
      <VideoProgressTracker
        progress={progress}
        currentStage={currentStage}
      />
    )}
    
    {videoUrl && (
      <VideoPlayer
        videoUrl={videoUrl}
        thumbnailUrl={thumbnailUrl}
      />
    )}
    
    <VideoGallery userId={user.id} />
  </>
)}
```

### 7. API Route Implementation

```typescript
// app/api/video/generate/route.ts
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { prompt, duration, aspectRatio, frameRate, style } = body;

  // Validate input
  if (!prompt || prompt.length < 10) {
    return Response.json({ error: 'Prompt too short' }, { status: 400 });
  }

  // Check credits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  const creditsNeeded = calculateVideoCredits(duration, frameRate, resolution);
  if (user.credits < creditsNeeded) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  // Create database record
  const generation = await prisma.videoGeneration.create({
    data: {
      userId: session.user.id,
      prompt,
      duration,
      aspectRatio,
      frameRate,
      resolution: '1080p',
      style,
      status: 'queued',
      creditsUsed: creditsNeeded,
      provider: 'runway', // or your chosen provider
    },
  });

  // Deduct credits
  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: creditsNeeded } },
  });

  // Submit to video provider
  try {
    const { jobId } = await videoProvider.generateVideo({
      prompt,
      duration,
      aspectRatio,
      frameRate,
      style,
    });

    await prisma.videoGeneration.update({
      where: { id: generation.id },
      data: {
        providerJobId: jobId,
        status: 'processing',
        startedAt: new Date(),
      },
    });

    return Response.json({ jobId: generation.id });
  } catch (error) {
    await prisma.videoGeneration.update({
      where: { id: generation.id },
      data: {
        status: 'failed',
        errorMessage: error.message,
      },
    });

    // Refund credits
    await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: creditsNeeded } },
    });

    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 8. Styling Requirements

**Follow existing Autogen Design patterns:**
- Dark theme with pastel-neon gradients (#7b61ff, #7bd7ff)
- Glassmorphism (backdrop-blur, white/5 backgrounds)
- Smooth transitions (300ms ease-in-out)
- Focus rings for accessibility
- Responsive breakpoints (mobile-first)

**Video-specific styles:**
```css
/* Video player */
.video-player-container {
  @apply relative rounded-xl overflow-hidden border border-white/10 bg-black;
}

.video-player video {
  @apply w-full h-auto object-contain;
}

.video-controls {
  @apply flex items-center gap-4 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent;
}

/* Progress bar */
.progress-bar {
  @apply relative h-2 rounded-full bg-white/10 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-[#7b61ff] to-[#7bd7ff] transition-all duration-300;
}

/* Style selector cards */
.style-card {
  @apply relative rounded-lg border border-white/10 bg-white/5 p-4 cursor-pointer transition-all hover:bg-white/10;
}

.style-card.selected {
  @apply border-[#7b61ff] bg-gradient-to-br from-[#7b61ff]/20 to-[#7bd7ff]/10;
}
```

### 9. Error Handling

**Implement comprehensive error handling:**
- Provider API failures → Show retry button
- Insufficient credits → Prompt to upgrade
- Content policy violations → Show specific guidance
- Network issues → Auto-retry with exponential backoff
- Timeout after 5 minutes → Cancel and refund

```typescript
try {
  await generateVideo(params);
} catch (error) {
  if (error instanceof InsufficientCreditsError) {
    toast.error('Not enough credits. Upgrade to continue.');
    router.push('/pricing');
  } else if (error instanceof ContentPolicyError) {
    toast.error('Prompt violates content policy. Please try again.');
  } else if (error instanceof TimeoutError) {
    toast.error('Generation took too long. Credits refunded.');
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

### 10. Testing Checklist

Before submitting, verify:

- [ ] Video generates successfully from text prompt
- [ ] Progress updates in real-time
- [ ] Video player controls work (play, pause, seek, loop)
- [ ] Download functionality works
- [ ] Credits are deducted correctly
- [ ] Credits are refunded on failure
- [ ] Gallery shows recent videos
- [ ] Mobile layout is responsive
- [ ] Error messages are clear and actionable
- [ ] Performance: <60s average generation time
- [ ] Security: All API keys are server-side only
- [ ] Accessibility: Keyboard navigation works
- [ ] Dark mode styling matches existing design

## Deliverables

1. **Code:**
   - All components, hooks, and API routes
   - Database migration file
   - Provider integration (choose one)
   - Type definitions

2. **Documentation:**
   - API endpoint documentation
   - Component usage examples
   - Environment variable setup
   - Deployment notes

3. **Testing:**
   - Test video generation with sample prompts
   - Performance benchmarks
   - Error scenario handling

4. **Validation**
    - Do not make any claims of completion, success, or functionality without closely inspecting the output and GUI to ensure UI accuracy and reliability.

## Success Criteria

Your implementation is successful if:
1. ✅ Users can generate 5s video from prompt in <60s
2. ✅ Progress tracking updates smoothly
3. ✅ Video player is polished and bug-free
4. ✅ UI matches existing Autogen Design aesthetic
5. ✅ No console errors or warnings
6. ✅ TypeScript strict mode passes
7. ✅ Code follows existing patterns and conventions

## Additional Resources

**API Documentation:**
- [Runway Gen-3 API](https://docs.runwayml.com/)
- [Pika Labs API](https://docs.pika.art/)
- [Stable Video Diffusion](https://github.com/Stability-AI/generative-models)

**Example Projects:**
- [Next.js Video Upload](https://github.com/vercel/next.js/tree/canary/examples/with-video)
- [React Video Player](https://github.com/cookpete/react-player)

**Existing Code to Reference:**
- `hooks/usePrediction.ts` - Pattern for generation hooks
- `components/Generator/ImageGenerator.tsx` - UI patterns
- `app/api/predictions/route.ts` - API route structure

## Timeline

- **Day 1-2:** Set up database schema, API routes, provider integration
- **Day 3-4:** Build UI components (controls, player, progress)
- **Day 5:** Integration and testing
- **Day 6:** Polish, documentation, deployment

Good luck! Build something amazing! 🚀
