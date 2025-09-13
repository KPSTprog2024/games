# Left-Back Echo Drawing App – Dev Quickstart

## Requirements
- Modern web browser with Canvas 2D support
- Pointer Events support (for Apple Pencil compatibility)

## Setup
Simply open `index.html` in a web browser or serve from a local web server.

## Run (dev)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Access: http://localhost:8000
```

## Project Structure
```
src/
  index.html          # Main HTML entry point
  main.ts             # App initialization
  core/
    types.ts          # Type definitions (Point, Stroke, Echo, Settings)
    utils.ts          # Math/interpolation/color conversion utilities
    scheduler.ts      # RAF and timer management
  input/
    pointer.ts        # Pointer event normalization (pen/touch/mouse)
  drawing/
    strokeManager.ts  # Stroke generation, interpolation, smoothing
    echoManager.ts    # Echo generation, transformation, cleanup
  render/
    renderer2d.ts     # Canvas2D drawing implementation
    renderer.ts       # IRenderer interface (for future WebGL switching)
  state/
    settings.ts       # Current UI values, preset management
    appState.ts       # Runtime flags, screen rotation handling
  ui/
    controls.ts       # Sliders and controls (decoupled from Renderer)
  perf/
    metrics.ts        # FPS, ms/frame measurement
    governor.ts       # Auto throttling, blur disable fallback
```

## Common Issues
- Canvas resolution appears low on iPad → Enable devicePixelRatio compensation in settings
- Apple Pencil not detected → Ensure Pointer Events are properly bound to canvas element
- Performance drops during long sessions → Check Governor auto-fallback settings

## Key Features
- **Left-back echo effect**: Strokes automatically generate trailing echoes that fade towards the back-left
- **Apple Pencil support**: Pressure-sensitive drawing with smooth interpolation
- **Performance governor**: Automatic quality adjustment to maintain 60fps target
- **Two rendering modes**: Flat (simple offset) and Pseudo-3D (vanishing point)

## Quick Test
1. Open the app
2. Draw with finger/stylus/mouse
3. Watch echoes fade towards left-back corner
4. Adjust settings with sliders on the right
5. Try different presets