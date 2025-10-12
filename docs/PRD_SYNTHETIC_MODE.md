# PRD: Synthetic Data & Evaluation Mode

## Product Overview

**Product Name:** Autogen Design - Synthetic/Eval Mode  
**Version:** 1.0  
**Target Release:** Q1 2025  
**Owner:** DarbotLabs
**Status:** Planning

## Executive Summary

The Synthetic/Eval Mode transforms Autogen Design into a synthetic data generation powerhouse for AI/ML teams, QA engineers, and researchers. Users can generate diverse, high-quality synthetic datasets for training, testing, evaluation, and edge case exploration without privacy concerns or data collection overhead.

## Problem Statement

### Current Pain Points
1. **Data scarcity:** ML teams struggle to find enough labeled training data
2. **Privacy concerns:** Real user data has GDPR/privacy restrictions
3. **Edge case coverage:** Rare scenarios are hard to capture in real datasets
4. **Data bias:** Real datasets often lack diversity and representation
5. **Cost:** Manual data labeling is expensive ($0.10-$1.00 per image)
6. **Time:** Collecting and curating datasets takes weeks/months

### User Needs
- Generate diverse synthetic faces/people for testing
- Create edge case scenarios (unusual lighting, angles, contexts)
- Produce evaluation datasets with ground truth labels
- Generate synthetic user personas for UX testing
- Create test data that doesn't violate privacy laws
- Build balanced datasets (gender, age, ethnicity representation)
- Generate synthetic environments/scenes for training
- Batch generation with consistent metadata

## Target Users

### Primary Personas

**1. ML Engineer (Priya, 29)**
- Training computer vision models
- Needs 10,000+ diverse face images
- Budget: $500/month for data
- Pain: Real datasets lack diversity
- Goal: Balanced training data for face recognition

**2. QA Engineer (David, 34)**
- Testing facial recognition software
- Needs edge cases (occlusion, lighting, angles)
- Pain: Manual test case creation is slow
- Goal: Automated test data generation

**3. Research Scientist (Dr. Chen, 42)**
- Studying AI bias and fairness
- Needs controlled synthetic experiments
- Pain: Real data has confounding variables
- Goal: Isolate specific variables (age, gender, lighting)

**4. Product Manager (Sarah, 31)**
- Creating user personas for UX research
- Needs realistic but synthetic profiles
- Pain: Stock photos feel generic
- Goal: Custom personas that match target demographics

## Goals & Success Metrics

### Primary Goals
1. **Adoption:** 20% of Pro users try Synthetic mode in first month
2. **Volume:** 50,000+ synthetic images generated monthly
3. **Batch Usage:** Average batch size of 25+ images
4. **Quality:** 4.5+ star rating on dataset quality
5. **Use Cases:** Support 5+ distinct use case categories

### Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Datasets Created | 1,000/month | Analytics |
| Avg. Dataset Size | 50+ images | Database query |
| Metadata Accuracy | 95%+ | User validation |
| Generation Speed | <3s per image | Performance logs |
| Batch Completion | 90%+ | Funnel analysis |

## Feature Requirements

### Must-Have (V1)

#### 1. Structured Metadata Input
**User Story:** As an ML engineer, I want to specify detailed attributes so that my synthetic dataset has controlled variation.

**Metadata Fields:**
```typescript
interface SyntheticAssetMetadata {
  // Core attributes
  assetType: "person" | "place" | "object" | "memory" | "scenario";
  displayName: string;        // "Jane Doe", "Modern Office", "iPhone"
  
  // Demographics (for people)
  age?: number | [number, number];  // Single or range: 25 or [25, 35]
  gender?: "male" | "female" | "non-binary" | "any";
  ethnicity?: string[];       // ["Asian", "Hispanic"]
  
  // Physical attributes
  attire?: string;            // "Business casual", "Athletic wear"
  accessories?: string[];     // ["Glasses", "Hat", "Jewelry"]
  hairStyle?: string;         // "Short curly", "Long straight"
  hairColor?: string;         // "Brown", "Blonde", "Black"
  
  // Context
  location?: string;          // "Office", "Park", "Studio"
  era?: string;               // "Modern", "1990s", "Victorian"
  lighting?: string;          // "Natural daylight", "Studio", "Low light"
  mood?: string;              // "Professional", "Casual", "Serious"
  environment?: string;       // "Indoor", "Outdoor", "Urban", "Rural"
  
  // Composition
  pose?: string;              // "Headshot", "Full body", "Three-quarter"
  angle?: string;             // "Straight on", "Profile", "Overhead"
  background?: string;        // "Solid color", "Blurred", "Detailed"
  
  // Quality controls
  resolution?: "standard" | "high" | "ultra";
  style?: "realistic" | "stylized" | "artistic";
  
  // Evaluation-specific
  groundTruth?: Record<string, any>;  // Labels for ML evaluation
  tags?: string[];            // ["test-case-1", "edge-case", "diverse"]
  notes?: string;             // Free-form annotation
}
```

**UI Layout:**
```tsx
<div className="synthetic-metadata-form">
  {/* Asset Type Selector */}
  <div className="form-group">
    <label>Asset Type</label>
    <select value={assetType} onChange={handleTypeChange}>
      <option value="person">Person</option>
      <option value="place">Place</option>
      <option value="object">Object</option>
      <option value="scenario">Scenario</option>
    </select>
  </div>

  {/* Conditional fields based on asset type */}
  {assetType === 'person' && (
    <>
      {/* Demographics */}
      <div className="form-group">
        <label>Age</label>
        <div className="age-input">
          <input type="number" min={0} max={100} placeholder="Single age" />
          <span>or range:</span>
          <input type="number" placeholder="Min" />
          <input type="number" placeholder="Max" />
        </div>
      </div>

      <div className="form-group">
        <label>Gender</label>
        <div className="radio-group">
          <label><input type="radio" name="gender" value="male" /> Male</label>
          <label><input type="radio" name="gender" value="female" /> Female</label>
          <label><input type="radio" name="gender" value="non-binary" /> Non-binary</label>
          <label><input type="radio" name="gender" value="any" /> Any</label>
        </div>
      </div>

      <div className="form-group">
        <label>Ethnicity (Multi-select)</label>
        <MultiSelect
          options={ETHNICITY_OPTIONS}
          value={ethnicity}
          onChange={setEthnicity}
        />
      </div>

      {/* Physical Attributes */}
      <div className="form-group">
        <label>Attire</label>
        <input 
          type="text" 
          placeholder="e.g., Business casual, Athletic wear"
          value={attire}
          onChange={e => setAttire(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Accessories</label>
        <TagInput
          tags={accessories}
          onChange={setAccessories}
          placeholder="Add accessory (Glasses, Hat, etc.)"
        />
      </div>
    </>
  )}

  {/* Context (shown for all types) */}
  <div className="form-group">
    <label>Location/Setting</label>
    <input
      type="text"
      placeholder="e.g., Modern office, City park"
      value={location}
      onChange={e => setLocation(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>Lighting</label>
    <select value={lighting} onChange={e => setLighting(e.target.value)}>
      <option value="natural">Natural daylight</option>
      <option value="studio">Studio lighting</option>
      <option value="low-light">Low light / Evening</option>
      <option value="harsh">Harsh / Direct sun</option>
      <option value="soft">Soft / Diffused</option>
    </select>
  </div>

  {/* Evaluation fields */}
  <div className="form-group">
    <label>Tags (for organization)</label>
    <TagInput
      tags={tags}
      onChange={setTags}
      placeholder="Add tag (test-set, diverse, edge-case)"
    />
  </div>

  <div className="form-group">
    <label>Notes</label>
    <textarea
      rows={3}
      placeholder="Additional context or requirements..."
      value={notes}
      onChange={e => setNotes(e.target.value)}
    />
  </div>
</div>
```

#### 2. Batch Generation
**User Story:** As a researcher, I want to generate hundreds of variations so that I can build comprehensive datasets.

**Features:**
- Specify batch size (1-100 images)
- Variation control (how much images differ)
- Consistent metadata across batch
- Partial variation (change only specific attributes)
- Progress tracking for large batches
- Resume interrupted batches

**Batch Configuration:**
```typescript
interface BatchGenerationConfig {
  batchSize: number;           // 1-100
  variationType: "random" | "controlled" | "sweep";
  
  // Random: Each image gets random variations
  randomConfig?: {
    variationStrength: number;  // 0-100 (how different each image is)
  };
  
  // Controlled: Specify which attributes vary
  controlledConfig?: {
    varyAttributes: string[];   // ["age", "lighting", "pose"]
    keepConstant: string[];     // ["gender", "ethnicity"]
  };
  
  // Sweep: Systematically vary one attribute
  sweepConfig?: {
    attribute: string;          // "age", "lighting", etc.
    values: any[];              // [20, 30, 40, 50] or ["morning", "noon", "evening"]
  };
}
```

**Batch UI:**
```tsx
<div className="batch-controls">
  <div className="form-group">
    <label>Batch Size</label>
    <input
      type="number"
      min={1}
      max={100}
      value={batchSize}
      onChange={e => setBatchSize(parseInt(e.target.value))}
    />
    <span className="hint">
      Cost: {batchSize * creditsPerImage} credits (~${batchSize * 0.10})
    </span>
  </div>

  <div className="form-group">
    <label>Variation Type</label>
    <select value={variationType} onChange={handleVariationTypeChange}>
      <option value="random">Random variations</option>
      <option value="controlled">Controlled variations</option>
      <option value="sweep">Parameter sweep</option>
    </select>
  </div>

  {variationType === 'random' && (
    <div className="form-group">
      <label>Variation Strength: {variationStrength}%</label>
      <input
        type="range"
        min={0}
        max={100}
        value={variationStrength}
        onChange={e => setVariationStrength(parseInt(e.target.value))}
      />
      <p className="hint">
        0% = Nearly identical | 100% = Maximum diversity
      </p>
    </div>
  )}

  {variationType === 'controlled' && (
    <>
      <div className="form-group">
        <label>Vary These Attributes</label>
        <MultiSelect
          options={AVAILABLE_ATTRIBUTES}
          value={varyAttributes}
          onChange={setVaryAttributes}
        />
      </div>
      <div className="form-group">
        <label>Keep Constant</label>
        <MultiSelect
          options={AVAILABLE_ATTRIBUTES}
          value={keepConstant}
          onChange={setKeepConstant}
        />
      </div>
    </>
  )}

  {variationType === 'sweep' && (
    <>
      <div className="form-group">
        <label>Sweep Attribute</label>
        <select value={sweepAttribute} onChange={e => setSweepAttribute(e.target.value)}>
          <option value="age">Age</option>
          <option value="lighting">Lighting</option>
          <option value="pose">Pose</option>
          <option value="angle">Camera Angle</option>
        </select>
      </div>
      <div className="form-group">
        <label>Values (one per image)</label>
        <TagInput
          tags={sweepValues}
          onChange={setSweepValues}
          placeholder="Add value (e.g., 20, 30, 40)"
        />
      </div>
    </>
  )}

  <button
    onClick={handleBatchGenerate}
    disabled={generating || batchSize < 1}
    className="btn-primary w-full"
  >
    Generate {batchSize} Images ({batchSize * creditsPerImage} credits)
  </button>
</div>
```

#### 3. Dataset Management
**User Story:** As a data scientist, I want to organize generated images into datasets so that I can download and use them for training. I also want to be able to batch edit existing datasets to generate new variations and "offspring" articacts based on real images so that synthetic recreated assets and datasets can be openly shared and used. 

**Features:**
- Create named datasets
- Add/remove images from datasets
- Dataset versioning
- Metadata export (JSON, CSV)
- Bulk download (ZIP)
- Dataset statistics dashboard

**Dataset Schema:**
```typescript
interface SyntheticDataset {
  id: string;
  name: string;
  description: string;
  userId: string;
  
  // Organization
  tags: string[];
  category: "training" | "validation" | "test" | "eval" | "exploration";
  
  // Content
  images: SyntheticImage[];
  totalImages: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
  
  // Statistics
  stats: {
    demographics?: {
      ageDistribution: Record<string, number>;
      genderDistribution: Record<string, number>;
      ethnicityDistribution: Record<string, number>;
    };
    attributes?: {
      lightingTypes: Record<string, number>;
      poses: Record<string, number>;
      locations: Record<string, number>;
    };
    quality: {
      avgFileSize: number;
      resolutions: Record<string, number>;
    };
  };
  
  // Export
  exportFormats: ("zip" | "json" | "csv" | "coco" | "yolo")[];
  downloadUrl?: string;
}
```

**Dataset UI:**
```tsx
<div className="dataset-manager">
  {/* Header */}
  <div className="dataset-header">
    <h2>{dataset.name}</h2>
    <p>{dataset.description}</p>
    <div className="dataset-meta">
      <span>{dataset.totalImages} images</span>
      <span>Version {dataset.version}</span>
      <span>{dataset.category}</span>
    </div>
  </div>

  {/* Statistics Dashboard */}
  <div className="dataset-stats grid grid-cols-3 gap-4">
    <div className="stat-card">
      <h4>Gender Distribution</h4>
      <PieChart data={dataset.stats.demographics.genderDistribution} />
    </div>
    <div className="stat-card">
      <h4>Age Distribution</h4>
      <BarChart data={dataset.stats.demographics.ageDistribution} />
    </div>
    <div className="stat-card">
      <h4>Lighting Types</h4>
      <PieChart data={dataset.stats.attributes.lightingTypes} />
    </div>
  </div>

  {/* Image Grid */}
  <div className="dataset-images">
    <div className="grid-header">
      <h3>Images ({dataset.images.length})</h3>
      <div className="actions">
        <button onClick={handleSelectAll}>Select All</button>
        <button onClick={handleDeselectAll}>Deselect All</button>
        <button onClick={handleDeleteSelected} disabled={selectedCount === 0}>
          Delete Selected ({selectedCount})
        </button>
      </div>
    </div>

    <div className="image-grid grid grid-cols-4 gap-4">
      {dataset.images.map(image => (
        <div key={image.id} className="image-card">
          <img src={image.thumbnailUrl} alt={image.displayName} />
          <div className="image-metadata">
            <h5>{image.displayName}</h5>
            <p className="text-xs">{image.tags.join(', ')}</p>
          </div>
          <div className="image-actions">
            <input
              type="checkbox"
              checked={selectedImages.includes(image.id)}
              onChange={() => toggleImageSelection(image.id)}
            />
            <button onClick={() => viewImageDetails(image)}>
              <InfoIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Export Options */}
  <div className="dataset-export">
    <h3>Export Dataset</h3>
    <div className="export-options">
      <label>
        <input type="checkbox" checked={exportZip} onChange={e => setExportZip(e.target.checked)} />
        ZIP Archive (images only)
      </label>
      <label>
        <input type="checkbox" checked={exportJSON} onChange={e => setExportJSON(e.target.checked)} />
        JSON Metadata
      </label>
      <label>
        <input type="checkbox" checked={exportCSV} onChange={e => setExportCSV(e.target.checked)} />
        CSV Spreadsheet
      </label>
      <label>
        <input type="checkbox" checked={exportCOCO} onChange={e => setExportCOCO(e.target.checked)} />
        COCO Format (ML training)
      </label>
    </div>
    <button onClick={handleExport} className="btn-primary">
      Export Dataset ({estimateExportSize()})
    </button>
  </div>
</div>
```

#### 4. Evaluation Ground Truth
**User Story:** As an ML engineer, I want to generate images with known ground truth labels so that I can evaluate model accuracy.

**Ground Truth Fields:**
```typescript
interface GroundTruth {
  // Classification labels
  primaryClass: string;        // "person", "car", "building"
  secondaryClasses?: string[]; // ["vehicle", "transportation"]
  
  // Object detection (bounding boxes)
  boundingBoxes?: Array<{
    class: string;
    x: number;              // Top-left x (pixels)
    y: number;              // Top-left y (pixels)
    width: number;          // Box width
    height: number;         // Box height
    confidence: number;     // 0-1 (for simulated detections)
  }>;
  
  // Segmentation masks
  segmentationMask?: {
    format: "rle" | "polygon" | "mask";
    data: string | number[][];
  };
  
  // Attributes
  attributes: Record<string, any>;  // { "age": 25, "gender": "female", "glasses": true }
  
  // Pose keypoints (for person detection)
  keypoints?: Array<{
    name: string;           // "nose", "left_eye", "right_shoulder"
    x: number;
    y: number;
    visibility: number;     // 0-1
  }>;
  
  // Custom labels
  customLabels?: Record<string, any>;
}
```

**Ground Truth UI:**
```tsx
<div className="ground-truth-config">
  <h3>Evaluation Ground Truth</h3>
  <p className="hint">
    Define labels and annotations that will be included in the export
  </p>

  {/* Classification */}
  <div className="form-group">
    <label>Primary Classification</label>
    <select value={primaryClass} onChange={e => setPrimaryClass(e.target.value)}>
      <option value="person">Person</option>
      <option value="vehicle">Vehicle</option>
      <option value="object">Object</option>
      <option value="scene">Scene</option>
    </select>
  </div>

  {/* Attributes */}
  <div className="form-group">
    <label>Annotated Attributes</label>
    <div className="attribute-list">
      {Object.entries(attributes).map(([key, value]) => (
        <div key={key} className="attribute-item">
          <span className="key">{key}:</span>
          <span className="value">{JSON.stringify(value)}</span>
          <button onClick={() => removeAttribute(key)}>×</button>
        </div>
      ))}
    </div>
    <button onClick={handleAddAttribute} className="btn-secondary">
      Add Attribute
    </button>
  </div>

  {/* Bounding Boxes (optional) */}
  <div className="form-group">
    <label>
      <input
        type="checkbox"
        checked={includeBoundingBoxes}
        onChange={e => setIncludeBoundingBoxes(e.target.checked)}
      />
      Include Bounding Boxes
    </label>
    {includeBoundingBoxes && (
      <p className="hint">
        Bounding boxes will be auto-generated based on detected objects
      </p>
    )}
  </div>

  {/* Export Format Preview */}
  <div className="ground-truth-preview">
    <h4>Export Preview (COCO Format)</h4>
    <pre className="code-block">
      {JSON.stringify({
        image_id: 12345,
        category_id: getCategoryId(primaryClass),
        bbox: [100, 150, 200, 300],
        attributes: attributes,
        ...
      }, null, 2)}
    </pre>
  </div>
</div>
```

### Should-Have (V2)

#### 5. Diversity Analytics
- Measure dataset diversity automatically
- Identify gaps in representation
- Suggest additional generations to balance dataset
- Bias detection and mitigation

#### 6. Active Learning Integration
- Import model predictions
- Generate hard examples (where model struggles)
- Targeted data augmentation
- Confidence-based sampling

#### 7. Synthetic Environments
- Generate complete scenes (not just single objects)
- Multi-object compositions
- Consistent lighting/style across scene
- Scene graphs for structured generation

#### 8. Temporal Consistency
- Generate video sequences with consistent identity
- Same person/object in different poses/contexts
- Track state changes over time
- Before/after comparisons

### Nice-to-Have (V3)

#### 9. Collaborative Datasets
- Share datasets with team members
- Version control and branching
- Merge datasets
- Collaborative annotation

#### 10. API Access
- Programmatic dataset generation
- Webhook notifications
- Bulk operations
- Integration with MLOps platforms

## Database Schema

```prisma
model SyntheticDataset {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name          String
  description   String?
  category      String   // "training", "validation", "test", "eval"
  tags          String[]
  version       Int      @default(1)
  
  images        SyntheticImage[]
  totalImages   Int      @default(0)
  
  // Statistics (JSON)
  statistics    Json?
  
  // Export
  exportFormats String[]
  lastExportUrl String?
  lastExportAt  DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([category])
}

model SyntheticImage {
  id            String   @id @default(cuid())
  datasetId     String?
  dataset       SyntheticDataset? @relation(fields: [datasetId], references: [id], onDelete: SetNull)
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Image data
  imageUrl      String
  thumbnailUrl  String?
  width         Int
  height        Int
  fileSize      Int
  
  // Synthetic metadata
  assetType     String   // "person", "place", "object", "scenario"
  displayName   String
  metadata      Json     // SyntheticAssetMetadata
  
  // Ground truth
  groundTruth   Json?    // GroundTruth labels
  
  // Organization
  tags          String[]
  
  // Analytics
  downloads     Int      @default(0)
  
  createdAt     DateTime @default(now())
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([datasetId])
  @@index([assetType])
}

model BatchGeneration {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  datasetId       String?
  dataset         SyntheticDataset? @relation(fields: [datasetId], references: [id])
  
  batchSize       Int
  completed       Int      @default(0)
  failed          Int      @default(0)
  
  config          Json     // BatchGenerationConfig
  status          String   @default("queued") // "queued", "processing", "completed", "failed", "paused"
  
  creditsUsed     Int
  
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  
  @@index([userId, status])
}
```

## Success Criteria

**Launch is successful if:**
1. ✅ 100+ datasets created in first month
2. ✅ Average dataset size >50 images
3. ✅ 4.5+ star rating on dataset quality
4. ✅ 80%+ batch completion rate
5. ✅ Export functionality works reliably

**Post-launch (3 months):**
1. ✅ ML teams using for training data
2. ✅ 5,000+ synthetic images generated weekly
3. ✅ Published case studies (bias reduction, edge case coverage)
4. ✅ Integration with popular ML tools (HuggingFace, Roboflow)

---

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Next Review:** Weekly during development
