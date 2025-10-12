# Generation Modes Architecture

## Overview

The Autogen Design platform now features a **tabbed generation interface** that organizes different content creation workflows into specialized modes. This makes it easier for users to access the right tools for their specific use case without overwhelming them with unnecessary options.

## Available Modes

### 1. **Images** 🖼️
*Generate high-quality images from text prompts*

**Enabled Controls:**
- ✅ Aspect ratio selection
- ✅ AI model selection
- ✅ Category, industry, audience, use case
- ✅ Topic & format options
- ✅ Look & feel, size, quality
- ✅ Color space & filter/effects
- ✅ Variations (count & intensity)
- ✅ Synthetic asset metadata

**Default Settings:**
- Category: Any
- Use Case: Any
- Format: PNG
- Aspect Ratio: 1:1

**Best For:**
- Marketing visuals
- Social media content
- Product mockups
- Concept art
- Personal projects

---

### 2. **Video** 🎬
*Create animated videos and motion graphics*

**Enabled Controls:**
- ✅ Aspect ratio selection
- ✅ AI model selection
- ✅ Category & use case
- ✅ Topic & look & feel
- ✅ Duration (seconds)
- ✅ Frame rate (fps)
- ✅ Animation style
- ✅ Variations

**Default Settings:**
- Category: Motion Graphics
- Use Case: Social Post
- Aspect Ratio: 16:9

**Best For:**
- Social media clips
- Explainer videos
- Animated logos
- Product demos
- Cartoon/anime content

**Animation Styles:**
- Realistic
- Cartoon
- Anime
- Motion graphics
- 3D rendered

---

### 3. **Synthetic/Eval** 🧪
*Generate synthetic datasets for testing and evaluation*

**Enabled Controls:**
- ✅ Aspect ratio selection
- ✅ AI model selection
- ✅ Category, industry, audience
- ✅ Topic, format, size, quality
- ✅ Variations
- ✅ Synthetic asset metadata
- ✅ Dataset size configuration
- ✅ Evaluation criteria

**Default Settings:**
- Category: Any
- Format: PNG
- Aspect Ratio: 1:1

**Best For:**
- AI/ML training data
- Testing edge cases
- A/B testing variations
- Evaluation datasets
- Synthetic personas
- Scenario simulation

**Special Features:**
- Batch generation for datasets
- Structured metadata capture
- Consistent variation control

---

### 4. **Brand Kit** 🎨
*Create cohesive brand assets and style guides*

**Enabled Controls:**
- ✅ Aspect ratio selection
- ✅ AI model selection
- ✅ Industry & audience
- ✅ Use case & topic
- ✅ Format, look & feel, size, quality
- ✅ Color space
- ✅ Brand elements selection
- ✅ Variations

**Default Settings:**
- Category: Branding
- Use Case: Hero Image
- Format: PNG
- Aspect Ratio: 16:9
- Look & Feel: Minimal

**Best For:**
- Logo concepts
- Color palette exploration
- Typography pairings
- Pattern libraries
- Marketing templates
- Style guide assets

**Brand Elements:**
- Logo variations
- Color palettes
- Typography samples
- Pattern/texture sets
- Icon families

---

### 5. **Engineering** ⚙️
*Generate technical diagrams, CAD, and 3D renderings*

**Enabled Controls:**
- ✅ Aspect ratio selection
- ✅ AI model selection
- ✅ Use case & topic
- ✅ Format, size, quality
- ✅ Diagram type
- ✅ Engineering format style
- ✅ Variations

**Default Settings:**
- Category: Concept Art
- Use Case: Storyboard Frame
- Format: PNG
- Aspect Ratio: 16:9
- Look & Feel: Minimal

**Best For:**
- Data flow diagrams
- CAD drawings
- 3D renderings
- Floor plans
- Circuit diagrams
- UML diagrams
- Network architecture

**Diagram Types:**
- `dataflow` - Data flow and system architecture
- `cad` - CAD and technical drawings
- `floorplan` - Architectural floor plans
- `circuit` - Electrical circuit diagrams
- `uml` - UML and software design
- `network` - Network topology diagrams
- `other` - Custom technical diagrams

**Engineering Formats:**
- `technical` - Clean technical style
- `schematic` - Schematic representation
- `isometric` - Isometric 3D view
- `blueprint` - Blueprint aesthetic

---

## Implementation Details

### File Structure

```
components/Generator/
├── types.ts                      # TypeScript definitions
├── generationModes.tsx           # Mode configurations
├── GenerationModeSwitcher.tsx    # Tab UI component
└── ImageGenerator.tsx            # Main generator with mode support
```

### Adding a New Mode

1. **Define the mode in `types.ts`:**
```typescript
export type GenerationMode = "images" | "video" | "synthetic" | "brand" | "engineering" | "your-mode";
```

2. **Add configuration in `generationModes.tsx`:**
```typescript
{
  id: "your-mode",
  label: "Your Mode",
  icon: YourIcon,
  description: "What this mode does",
  enabledControls: {
    aspectRatio: true,
    model: true,
    // ... other controls
  },
  defaults: {
    category: "Default Category",
    // ... other defaults
  },
}
```

3. **Conditional rendering uses:**
```typescript
{isControlEnabled(generationMode, "controlName") && (
  <YourControl />
)}
```

### Control Visibility

Controls automatically show/hide based on the active mode configuration. The `isControlEnabled()` helper checks if a control is enabled for the current mode.

**Available Controls:**
- `aspectRatio`
- `model`
- `category`
- `industry`
- `audience`
- `useCase`
- `topic`
- `format`
- `lookAndFeel`
- `size`
- `quality`
- `colorSpace`
- `filter`
- `variations`
- `syntheticAsset`
- `diagramType` (Engineering)
- `engineeringFormat` (Engineering)
- `brandElements` (Brand)
- `duration` (Video)
- `frameRate` (Video)
- `animationStyle` (Video)

---

## User Experience

### Desktop View
Tabs are displayed horizontally with icons and labels. The active tab has a gradient background and a bottom indicator line.

### Mobile View
Tabs collapse into a dropdown select menu for better space utilization.

### Mode Switching
When switching modes:
1. Incompatible controls hide automatically
2. Default values load for the new mode
3. The prompt field and generation history persist
4. User's previous settings in each mode are remembered (via state)

---

## API Integration

All generation modes currently use the **Azure Flux API** with multi-variation support:

```typescript
// Variation support (all modes)
const variationCount = Math.min(Math.max(1, options?.variationCount || 1), 4);
const variationStrength = options?.variationStrength || 35;

// Each variation is stored separately with metadata
{
  variationIndex: i,
  totalVariations: variationCount,
  // ... other fields
}
```

### Future Enhancements

- **Video mode:** Integration with video generation APIs (Runway, Pika, etc.)
- **Engineering mode:** Specialized diagram generation APIs or fine-tuned models
- **Brand mode:** Multi-asset batch generation with style consistency
- **Synthetic/Eval:** Automated dataset creation pipelines

---

## Benefits

1. **Simplified UX:** Users only see relevant controls for their task
2. **Faster workflows:** Preset defaults for common scenarios
3. **Scalability:** Easy to add new modes without cluttering the UI
4. **Consistency:** Shared controls behave the same across modes
5. **Discoverability:** Clear categories help users find the right tool

---

## Migration Notes

**From Previous Version:**
- All existing "Images" functionality remains unchanged
- New modes are additive (backward compatible)
- Existing API routes work with all modes
- Presets work across all modes
- Variation support is fully implemented and wired

**Removed:**
- ❌ Outdated TODO comments about variation API wiring
- ❌ Hardcoded control visibility (now mode-based)

---

## Related Documentation

- [Testing Guide](./TESTING_GUIDE.md)
- [Azure Flux Integration](./AZURE_FLUX_INTEGRATION.md)
- [PRD UI Enhancements](./PRD_UI_ENHANCEMENTS.md)

---

**Last Updated:** October 11, 2025
