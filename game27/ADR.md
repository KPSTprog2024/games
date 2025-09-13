# Architectural Decision Records (ADR-lite)

## ADR-001: Canvas 2D Renderer for Initial Implementation
**Date:** 2025-09-13  
**Context:** Need to choose rendering technology for echo drawing app. Options include Canvas 2D, WebGL, and SVG.  
**Decision:** Use Canvas 2D for v1 implementation with IRenderer abstraction layer.  
**Rationale:** Canvas 2D provides sufficient performance for initial scope, has excellent browser compatibility, and simpler debugging. WebGL offers better performance but adds complexity and longer development time.  
**Consequences:** Blur effects are limited by canvas shadowBlur API. Will need WebGL migration path for complex visual effects, but abstraction layer allows clean switching later.

---

## ADR-002: Echo Storage as Vector References (Not Raster Cache)
**Date:** 2025-09-13  
**Context:** Echo snapshots can be stored as either vector references to original strokes or as pre-rendered raster bitmaps.  
**Decision:** Store echoes as references to stroke vector data, render with transforms at draw time.  
**Rationale:** Enables real-time parameter adjustment (color decay, scaling) without regenerating cache. Lower memory usage for typical session. Simpler initial implementation.  
**Consequences:** Higher per-frame CPU cost for coordinate transforms. May need raster caching optimization if performance becomes issue, but Governor system can handle automatic fallback.

---

## ADR-003: Dual Timer System (RAF + setInterval) 
**Date:** 2025-09-13  
**Context:** Echo generation timing needs to be consistent (100ms) while drawing updates need smooth 60fps.  
**Decision:** Use requestAnimationFrame for drawing loop and separate setInterval for echo snapshots.  
**Rationale:** RAF provides optimal frame pacing for smooth drawing. setInterval ensures consistent echo timing independent of frame rate. Dual system prevents echo timing drift during performance variations.  
**Consequences:** Slightly more complex scheduler implementation. Echo timing may lag briefly during heavy performance drops, but this is acceptable vs. timing drift.

---

## ADR-004: Settings Store with Reactive Updates
**Date:** 2025-09-13  
**Context:** UI sliders need to update rendering in real-time without manual refresh triggers.  
**Decision:** Implement reactive SettingsStore with subscription pattern.  
**Rationale:** Enables immediate visual feedback when adjusting parameters. Keeps UI and business logic decoupled. Supports future features like preset animation or settings persistence.  
**Consequences:** Adds subscription management complexity. All systems must handle partial settings updates gracefully.

---

## ADR-005: Performance Governor with Automatic Quality Degradation
**Date:** 2025-09-13  
**Context:** App must maintain usable performance across wide range of devices from iPhone 8 to iPad Pro.  
**Decision:** Implement automatic quality scaling that reduces visual fidelity to maintain target frame rate.  
**Rationale:** Better user experience than choppy animation. Allows single codebase across device classes. Users get best quality their device can handle without manual tuning.  
**Consequences:** Requires performance monitoring overhead. Quality may change during session, potentially confusing users. Need clear feedback when degradation occurs.

---

## ADR-006: Flat Mode as Primary Rendering (Pseudo-3D as Enhancement)
**Date:** 2025-09-13  
**Context:** Two approaches for echo positioning: simple offset vs. perspective transformation to vanishing point.  
**Decision:** Default to "flat" mode with simple linear transforms, offer "pseudo-3d" as advanced option.  
**Rationale:** Flat mode is more performant and easier to tune. Most users will prefer simpler visual style. Pseudo-3D adds complexity that may not be worth the visual benefit for typical use cases.  
**Consequences:** Pseudo-3D mode may feel like secondary feature. Need to ensure both modes are well-tested and properly documented.

---

## ADR-007: Pointer Events API for Input Normalization  
**Date:** 2025-09-13  
**Context:** Need to support mouse, touch, and Apple Pencil with unified interface.  
**Decision:** Use Pointer Events API to normalize all input types into single Point data structure.  
**Rationale:** Pointer Events provide unified interface across input types with pressure support. Better than managing separate mouse/touch event handlers. Good Apple Pencil integration on Safari.  
**Consequences:** Requires Pointer Events polyfill for older browsers. Some legacy touch gesture patterns may need adjustment.

---

## ADR-008: No Stroke History Persistence
**Date:** 2025-09-13  
**Context:** Could implement undo/redo functionality by storing completed stroke history.  
**Decision:** Focus on real-time drawing experience, defer undo/redo to future version.  
**Rationale:** Undo/redo adds significant complexity to memory management and echo lifecycle. Core value proposition is the echo effect itself, not editing capabilities. Clear button provides sufficient reset functionality for v1.  
**Consequences:** Users cannot undo individual strokes, only clear entire canvas. May limit usefulness for precise drawing tasks.

---

## ADR-009: HSL Color Space for Echo Color Decay
**Date:** 2025-09-13  
**Context:** Color decay effect needs to reduce saturation/lightness of echoes while preserving hue.  
**Decision:** Convert colors to HSL space for decay calculations, convert back to RGB for rendering.  
**Rationale:** HSL allows independent control of lightness and saturation while preserving hue relationships. Produces more natural-looking fade effect than simple RGB scaling.  
**Consequences:** Adds color space conversion overhead. May have slight precision loss in RGB→HSL→RGB conversion, but imperceptible in practice.

---

## ADR-010: Module Dependency Injection at Startup
**Date:** 2025-09-13  
**Context:** Modules like EchoManager need access to StrokeManager and Renderer, could use global references or dependency injection.  
**Decision:** Use constructor-based dependency injection configured in main App initialization.  
**Rationale:** Makes dependencies explicit and testable. Avoids global state issues. Enables clean unit testing with mock dependencies. Follows standard architectural patterns.  
**Consequences:** Requires careful dependency ordering during initialization. More verbose setup code, but worth it for maintainability and testing.

---

## ADR-011: TypeScript for Type Safety and Developer Experience  
**Date:** 2025-09-13  
**Context:** Could implement in vanilla JavaScript or TypeScript.  
**Decision:** Use TypeScript for all modules with strict type checking enabled.  
**Rationale:** Complex coordinate transforms and parameter management benefit from compile-time type checking. Better IDE support for refactoring and navigation. Interfaces like IRenderer require strong type contracts.  
**Consequences:** Requires TypeScript compilation step. May slow down quick prototyping, but prevents entire classes of runtime errors.

---

## ADR-012: No External Dependencies (Vanilla Implementation)
**Date:** 2025-09-13  
**Context:** Could use libraries for interpolation, color manipulation, or UI components.  
**Decision:** Implement all functionality with vanilla web APIs to avoid external dependencies.  
**Rationale:** Keeps bundle size minimal for mobile performance. Avoids version conflicts and supply chain security issues. Educational value of implementing algorithms directly. Full control over performance characteristics.  
**Consequences:** More implementation work for features like Catmull-Rom interpolation. May reinvent some wheels, but keeps codebase self-contained and understandable.