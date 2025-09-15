# Drawing Pipeline & Parameter Specifications

## Drawing Pipeline (Frame Execution Order)

### Main Loop Sequence
1. **perf.update(deltaTime)** - Update FPS metrics and timing data
2. **echoManager.cullOffscreen(bounds)** - Remove echoes that have moved off-screen
3. **governor.apply(settings, perf)** - Apply automatic quality adjustments if needed
4. **renderer.clear()** - Clear the canvas for new frame
5. **Echo Rendering (back-to-front):**
   - for k = maxK → 0: renderer.drawEcho(snapshot, k, transform_params)
6. **renderer.drawStroke(currentStroke)** - Draw active stroke on top
7. **UI updates** - Update sliders and controls if needed

### Echo Generation (Parallel Timer)
- Triggered every `echoIntervalMs` via setInterval
- `echoManager.snapshot(strokeManager.getCurrentPath())`
- Independent of RAF to maintain consistent timing

### Transform Pipeline (per Echo)
For echo at depth k:
1. Calculate base transform: `dx = k * shiftX, dy = k * shiftY, scale = scaleStep^k`
2. Apply mode-specific adjustment (Flat vs Pseudo-3D)
3. Set alpha: `alpha = baseAlpha * alphaStep^k`
4. Set blur: `blur = k * blurPerEcho`
5. Apply color decay if enabled: HSL lightness/saturation reduction

---

## Parameter Specifications

### Echo Timing
| Parameter | Default | Range | Unit | Effect |
|-----------|---------|-------|------|--------|
| echoIntervalMs | 70 | 30–200 | ms | How often new echoes are created |

### Echo Quantity  
| Parameter | Default | Range | Unit | Effect |
|-----------|---------|-------|------|--------|
| echoCountMax | 80 | 10–200 | count | Maximum simultaneous echoes |

### Spatial Transform
| Parameter | Default | Range | Unit | Effect |
|-----------|---------|-------|------|--------|
| shiftX | -8 | -20 to +20 | px/echo | Horizontal offset per echo depth |
| shiftY | -5 | -20 to +20 | px/echo | Vertical offset per echo depth |
| scalePerEcho | 0.965 | 0.90–0.99 | ratio | Size reduction per echo depth |

### Visual Decay
| Parameter | Default | Range | Unit | Effect |
|-----------|---------|-------|------|--------|
| alphaPerEcho | 0.93 | 0.85–0.98 | ratio | Opacity reduction per echo depth |
| blurPerEcho | 0.2 | 0–0.8 | px/echo | Blur increase per echo depth |

### Rendering Mode
| Parameter | Default | Options | Effect |
|-----------|---------|---------|--------|
| mode | "flat" | "flat", "pseudo3d" | Transform calculation method |

### Pseudo-3D Parameters (when mode="pseudo3d")
| Parameter | Default | Range | Unit | Effect |
|-----------|---------|-------|------|--------|
| vanish.x | 80 | 0–canvas.width | px | Vanishing point X coordinate |
| vanish.y | 80 | 0–canvas.height | px | Vanishing point Y coordinate |
| persp | 0.06 | 0.01–0.2 | factor | Perspective intensity (lower = stronger) |

### Color Enhancement
| Parameter | Default | Options | Effect |
|-----------|---------|---------|--------|
| colorDecay | "off" | "off", "light", "strong" | HSL lightness/saturation reduction |
| trailQuality | "normal" | "normal", "high" | Catmull-Rom interpolation density |

---

## Presets

### Depth-Soft (Default)
```
echoIntervalMs: 70
echoCountMax: 80
shiftX: -8, shiftY: -5
scalePerEcho: 0.965
alphaPerEcho: 0.93
blurPerEcho: 0.2
mode: "flat"
colorDecay: "light"
```
**Characteristics:** Gentle depth illusion, moderate performance impact

### Film-Echo (Artistic)
```
echoIntervalMs: 120
echoCountMax: 24
shiftX: -10, shiftY: -6
scalePerEcho: 0.95
alphaPerEcho: 0.9
blurPerEcho: 0.4
mode: "flat"
colorDecay: "strong"
```
**Characteristics:** Dramatic trailing effect, higher blur for cinematic look

### Wireframe-Lite (Performance)
```
echoIntervalMs: 80
echoCountMax: 32
shiftX: -5, shiftY: -3
scalePerEcho: 0.975
alphaPerEcho: 0.95
blurPerEcho: 0.0
mode: "flat"
colorDecay: "off"
```
**Characteristics:** Clean geometric trails, optimized for 60fps on mobile

### Pseudo-3D-Demo (Showcase)
```
echoIntervalMs: 100
echoCountMax: 40
shiftX: -4, shiftY: -3
scalePerEcho: 0.97
alphaPerEcho: 0.94
blurPerEcho: 0.15
mode: "pseudo3d"
vanish: {x: 80, y: 80}
persp: 0.08
colorDecay: "light"
```
**Characteristics:** True perspective convergence to vanishing point

---

## Performance Considerations

### Target Metrics
- **iPad Pro**: 60fps sustained, echo rendering < 6ms/frame
- **iPhone**: 60fps target, 30fps minimum, echo rendering < 10ms/frame
- **Memory**: Stable growth pattern, GC every 2-3 minutes max

### Automatic Quality Scaling
The Governor system monitors performance and applies these fallbacks in order:

1. **Light Load (fps < 45 for 2 seconds):**
   - Set blurPerEcho = 0
   
2. **Medium Load (fps < 35 for 3 seconds):**
   - Reduce echoCountMax by 8 (minimum 16)
   
3. **Heavy Load (fps < 25 for 5 seconds):**
   - Enable sparse rendering: draw only every 2nd echo for k > 30
   
4. **Critical Load (fps < 20 for 10 seconds):**
   - Reduce scalePerEcho toward 1.0 (reduces transform cost)
   - Set colorDecay = "off"

### Recovery Hysteresis
Quality settings are restored gradually when fps > (target + 10) for sustained periods to prevent oscillation.