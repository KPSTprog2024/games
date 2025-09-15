# System Overview

## Architecture Summary
- **Rendering**: Canvas2D (future WebGL2 migration via abstraction)
- **Main Loop**: RAF + setInterval(echoInterval) dual-timer system
- **Key Modules**: App / Scheduler / Input / StrokeManager / EchoManager / Renderer / Settings / Perf(Governor)
- **Design Principle**: One-way dependencies, renderer abstraction, performance-first fallback

## Core Concept
The app captures user strokes every 70ms, creating "echo snapshots" that gradually fade towards the left-back direction (-X, -Y, +Z visual effect), with automatic size/opacity/blur reduction to simulate depth.

## Module Responsibilities

### App (main.ts)
Central coordinator that initializes all modules and manages the main rendering loop.

### Scheduler (core/scheduler.ts)
Manages requestAnimationFrame for drawing and setInterval for echo generation timing.

### Input (input/pointer.ts)
Normalizes Pointer Events from pen/touch/mouse into unified Point data with pressure information.

### StrokeManager (drawing/strokeManager.ts)
Handles active stroke creation, point smoothing via Catmull-Rom interpolation, and path optimization.

### EchoManager (drawing/echoManager.ts)
Creates periodic snapshots of strokes and manages their lifecycle with automatic cleanup.

### Renderer (render/)
Abstracted rendering interface with Canvas2D implementation. Handles coordinate transforms, alpha blending, and blur effects.

### Settings (state/settings.ts)
Centralized configuration store with UI binding and preset management.

### Performance System (perf/)
FPS monitoring and automatic quality degradation (Governor) to maintain target framerate.

## Dependency Map
```
App (coordinator)
 ├─ Scheduler (timing)
 ├─ Input → StrokeManager (event flow)
 ├─ StrokeManager → core/types (data structures)
 ├─ EchoManager → StrokeManager (read-only snapshot access)
 ├─ Renderer ← Canvas2DRenderer (implementation)
 ├─ SettingsStore ← UI/Controls (bidirectional updates)
 └─ PerfMetrics → Governor → Settings (auto-adjustment)
```

**Key Principles:**
- **One-way flow**: All dependencies point toward abstractions, no circular references
- **Renderer isolation**: Drawing implementation can be swapped without touching business logic  
- **Governor autonomy**: Performance system can override settings temporarily during load
- **State centralization**: Settings store is the single source of truth for all configuration

## Data Flow
1. **Input**: Pointer events → normalized Points → StrokeManager
2. **Drawing**: Active stroke updated in real-time via RAF
3. **Echo Generation**: Every 70ms, current stroke snapshot → EchoManager queue
4. **Rendering**: Clear → Draw echoes (back-to-front) → Draw active stroke
5. **Performance**: Monitor frame time → Governor adjusts settings if needed

## Future Migration Paths
- **WebGL2**: Swap Canvas2DRenderer for WebGL2Renderer via IRenderer interface
- **OffscreenCanvas**: Move rendering to Worker thread for better performance
- **Touch enhancements**: Extend Point type with tilt/twist data for advanced stylus support