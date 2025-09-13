# Module Contracts (Interface Specifications)

## StrokeManager (drawing/strokeManager.ts)

**Do:**
- Manage active stroke lifecycle: beginStroke() / addPoint() / endStroke()
- Point smoothing and interpolation (Catmull-Rom when trailQuality="high")
- Automatic point thinning to reduce noise
- Provide read-only access to current stroke state

**Don't:**
- Handle screen clearing or any rendering operations
- Manage echo generation or stroke history beyond current active stroke
- Directly manipulate UI or settings

**Public API:**
```typescript
beginStroke(color: string, width: number, alpha: number): void
addPoint(point: Point): void
endStroke(): void
getCurrentPath(): Stroke | undefined
simplifyIfNeeded(): void
interpolate(quality: "normal" | "high"): void
```

**Performance Notes:** Point thinning based on distance threshold, Catmull-Rom applied only for "high" quality.

---

## EchoManager (drawing/echoManager.ts)

**Do:**
- Create periodic snapshots of stroke state every echoInterval
- Manage echo queue with configurable maximum count
- Provide render-ready echo data with transformation parameters
- Automatic cleanup of off-screen or expired echoes

**Don't:**
- Modify stroke geometry or colors (read-only access)
- Perform actual rendering operations
- Handle UI interactions or settings changes directly

**Public API:**
```typescript
snapshot(stroke: Stroke | undefined): void
getRenderPlan(): Array<{snap: EchoSnapshot; k: number}>
cullOffscreen(bounds: {w: number; h: number}): void
updateSettings(settings: Settings): void
```

**Data Structure:** snapshots array, newest at index 0, auto-pruned at echoCountMax

---

## Renderer Interface (render/renderer.ts)

**Do:**
- Provide hardware-agnostic drawing operations
- Handle coordinate transforms for echo positioning
- Manage canvas state (clear, alpha blending, blur effects)
- Return canvas bounds for culling calculations

**Don't:**
- Store application state or stroke data
- Handle input events or user interactions
- Make decisions about what to render (data comes from managers)

**Public API:**
```typescript
interface IRenderer {
  clear(): void
  drawStroke(stroke: Stroke): void
  drawEcho(stroke: Stroke, k: number, params: EchoRenderParams): void
  getBounds(): {w: number; h: number}
  setBackground(color: string): void
}
```

**Canvas2D Implementation:**
- Uses save/restore for transform isolation
- shadowBlur for depth effect (disabled during performance fallback)
- Integer coordinate rounding for crisp rendering

---

## Scheduler (core/scheduler.ts)

**Do:**
- Manage requestAnimationFrame loop for smooth rendering
- Handle echo generation timer with configurable interval
- Provide frame timing data for performance monitoring
- Allow dynamic timer adjustment without restart

**Don't:**
- Make rendering decisions or manipulate drawing data
- Handle performance fallback logic (that's Governor's job)
- Store application state beyond timing control

**Public API:**
```typescript
onFrame: (deltaTime: number) => void
onEchoTick: () => void
startRAF(): void
startEchoTimer(intervalMs: number): void
setEchoInterval(ms: number): void
stop(): void
```

---

## SettingsStore (state/settings.ts)

**Do:**
- Store and validate all configurable parameters
- Notify subscribers of setting changes
- Manage preset configurations (Depth-Soft, Film-Echo, Wireframe-Lite)
- Provide type-safe access to all settings

**Don't:**
- Directly manipulate rendering or drawing systems
- Handle UI widget creation (Controls handles that)
- Store runtime state like current stroke or echoes

**Public API:**
```typescript
get value(): Settings
subscribe(callback: (settings: Settings) => void): () => void
set(partial: Partial<Settings>): void
loadPreset(name: string): void
```

**Parameter Validation:** All numeric values clamped to safe ranges, mode validated against enum.

---

## PointerInput (input/pointer.ts)

**Do:**
- Normalize Pointer Events from all input devices (pen/touch/mouse)
- Extract pressure information when available
- Convert screen coordinates to canvas coordinates
- Handle pointer capture for smooth drawing

**Don't:**
- Store stroke data or drawing history
- Perform coordinate transformations for echoes
- Handle drawing logic or stroke lifecycle

**Public API:**
```typescript
onDown: (point: Point) => void
onMove: (point: Point) => void
onUp: (point: Point) => void
attach(canvas: HTMLCanvasElement): void
detach(): void
```

**Point Normalization:** pressure defaults to 1.0 for non-pressure devices, coordinates adjusted for devicePixelRatio.

---

## PerfMetrics & Governor (perf/)

**Do:**
- Monitor frame timing and maintain rolling FPS average
- Automatically degrade quality settings when performance drops
- Implement hysteresis to prevent setting oscillation
- Log performance events for debugging

**Don't:**
- Directly manipulate rendering operations
- Override user settings permanently (temporary adjustments only)
- Handle user interface updates

**Public API:**
```typescript
// PerfMetrics
class PerfMetrics {
  fps: number
  frameMs: number  
  update(deltaTime: number): void
}

// Governor  
class Governor {
  apply(settings: Settings, perf: PerfMetrics): Partial<Settings>
}
```

**Fallback Strategy:** blur→0, echoCountMax-=8, sparse rendering for k>30, scale adjustment as last resort.