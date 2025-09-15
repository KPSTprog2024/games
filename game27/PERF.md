# Performance Budget & Fallback Strategy

## Performance Targets

### Frame Rate Objectives
| Device Class | Target FPS | Minimum FPS | Critical FPS |
|--------------|------------|-------------|--------------|
| iPad Pro | 60 | 45 | 25 |
| iPad (standard) | 60 | 40 | 20 |
| iPhone (recent) | 60 | 35 | 20 |
| iPhone (older) | 45 | 30 | 15 |
| Desktop | 60 | 50 | 30 |

### Rendering Budget (per frame)
| Device Class | Echo Render Time | Total Frame Time | Memory Growth |
|--------------|------------------|------------------|---------------|
| iPad Pro | < 6ms | < 16ms (60fps) | < 2MB/min |
| iPad (standard) | < 8ms | < 20ms (50fps) | < 1.5MB/min |
| iPhone | < 10ms | < 25ms (40fps) | < 1MB/min |
| Desktop | < 5ms | < 16ms (60fps) | < 3MB/min |

### Measurement Window
- **Short-term**: Rolling 1-second average (60 samples at 60fps)
- **Medium-term**: 3-second evaluation window for fallback decisions  
- **Long-term**: 10-second stability check for recovery

---

## Automatic Fallback Rules

### Stage 1: Light Performance Issues
**Trigger:** FPS < (Target - 15) for 2 consecutive seconds
**Example:** iPad Pro drops below 45fps

**Actions:**
1. Set `blurPerEcho = 0` (disable shadow blur completely)
2. Log: "Performance fallback Stage 1: Blur disabled"

**Expected Gain:** 15-25% rendering performance improvement

### Stage 2: Moderate Performance Issues  
**Trigger:** FPS < (Target - 20) for 3 consecutive seconds
**Example:** iPad Pro drops below 40fps

**Actions:**
1. Maintain Stage 1 adjustments
2. Reduce `echoCountMax` by 8 (minimum floor: 16)
3. Log: "Performance fallback Stage 2: Echo count reduced to {count}"

**Expected Gain:** 20-30% reduction in drawing operations

### Stage 3: Severe Performance Issues
**Trigger:** FPS < (Target - 30) for 5 consecutive seconds  
**Example:** iPad Pro drops below 30fps

**Actions:**
1. Maintain Stage 1-2 adjustments
2. Enable sparse echo rendering: only draw echoes where `k % 2 === 0` for `k > 30`
3. Log: "Performance fallback Stage 3: Sparse echo rendering enabled"

**Expected Gain:** 30-40% reduction in distant echo draws

### Stage 4: Critical Performance Issues
**Trigger:** FPS < (Target - 35) for 10 consecutive seconds
**Example:** iPad Pro drops below 25fps

**Actions:**
1. Maintain Stage 1-3 adjustments
2. Set `scalePerEcho = 0.98` (reduce transform complexity)
3. Set `colorDecay = "off"` (disable HSL calculations)
4. Reduce `echoCountMax` to absolute minimum: 12
5. Log: "Performance fallback Stage 4: Critical mode enabled"

**Expected Gain:** 40-50% overall performance improvement

---

## Recovery Strategy (Hysteresis)

### Gradual Quality Restoration
To prevent oscillating between quality levels, recovery requires sustained good performance:

**Stage 4 → Stage 3 Recovery:**
- Trigger: FPS > (Target - 5) for 15 consecutive seconds
- Action: Restore colorDecay and scalePerEcho, keep other Stage 3 restrictions

**Stage 3 → Stage 2 Recovery:**
- Trigger: FPS > (Target - 5) for 12 consecutive seconds  
- Action: Disable sparse rendering, keep echoCountMax restrictions

**Stage 2 → Stage 1 Recovery:**
- Trigger: FPS > (Target - 5) for 10 consecutive seconds
- Action: Restore echoCountMax to (current + 8), max: original setting

**Stage 1 → Full Quality Recovery:**
- Trigger: FPS > Target for 8 consecutive seconds
- Action: Restore blurPerEcho to original setting

### Recovery Logging
```
"Performance recovery Stage {from}→{to}: {restored_features}"
"Full performance recovery: all features restored"
```

---

## Performance Monitoring Implementation

### Metrics Collection
```typescript
class PerfMetrics {
  private samples: number[] = []
  private readonly WINDOW_SIZE = 60 // 1 second at 60fps
  
  fps: number = 60
  frameMs: number = 16.67
  avgFrameMs: number = 16.67
  
  update(deltaTime: number): void {
    this.frameMs = deltaTime
    this.samples.push(deltaTime)
    if (this.samples.length > this.WINDOW_SIZE) {
      this.samples.shift()
    }
    this.avgFrameMs = this.samples.reduce((a,b) => a+b) / this.samples.length
    this.fps = 1000 / this.avgFrameMs
  }
}
```

### Governor Decision Logic
```typescript
class Governor {
  private stageHistory: number[] = []
  private readonly STAGE_MEMORY = 180 // 3 seconds at 60fps
  
  apply(settings: Settings, perf: PerfMetrics): Partial<Settings> {
    const target = this.getTargetFPS(settings.deviceClass)
    const stage = this.determineStage(perf.fps, target)
    
    this.stageHistory.push(stage)
    if (this.stageHistory.length > this.STAGE_MEMORY) {
      this.stageHistory.shift()
    }
    
    return this.applyStageAdjustments(stage, settings)
  }
}
```

---

## Device Detection & Classification

### Automatic Device Classification
The system attempts to classify devices for appropriate performance targets:

```typescript
type DeviceClass = 'ipad-pro' | 'ipad' | 'iphone-recent' | 'iphone-older' | 'desktop'

function detectDeviceClass(): DeviceClass {
  const ua = navigator.userAgent
  const memory = (navigator as any).deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 2
  
  if (ua.includes('iPad')) {
    return memory >= 8 ? 'ipad-pro' : 'ipad'
  }
  if (ua.includes('iPhone')) {
    return cores >= 6 ? 'iphone-recent' : 'iphone-older'  
  }
  return 'desktop'
}
```

### Manual Override
Users can override device classification through settings if auto-detection is incorrect.

---

## Debug Information

### Performance Panel (Debug Mode)
When enabled, displays:
- Current FPS (1-second rolling average)
- Echo render time (ms)
- Active fallback stage
- Memory usage estimate
- Echo count (current vs. original setting)

### Console Logging
Performance events are logged with timestamps for debugging:
```
[09:13:45.123] Performance fallback Stage 2: Echo count reduced to 72
[09:13:50.456] Echo render time: 12.3ms (target: <8ms)
[09:14:02.789] Performance recovery Stage 2→1: Echo count restored to 80
```

### Export Performance Data
Debug builds can export performance data as CSV for analysis:
```
timestamp,fps,frameMs,echoRenderMs,echoCount,stage,memoryMB
1694598825123,58.2,17.2,6.1,80,0,45.2
1694598825139,56.8,17.6,6.8,80,0,45.3
...
```