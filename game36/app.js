(() => {
  'use strict';

  const dom = {
    video: document.getElementById('camera'),
    composite: document.getElementById('composite'),
    grid: document.getElementById('grid'),
    status: document.getElementById('status'),
    startStop: document.getElementById('start-stop'),
    captureStill: document.getElementById('capture-still'),
    recordToggle: document.getElementById('record-toggle'),
    switchCamera: document.getElementById('switch-camera'),
    recaptureBackground: document.getElementById('recapture-background'),
    intervalSlider: document.getElementById('interval-slider'),
    bufferSlider: document.getElementById('buffer-slider'),
    intervalLabel: document.getElementById('interval-label'),
    bufferLabel: document.getElementById('buffer-label'),
    segmentationToggle: document.getElementById('segmentation-toggle'),
    backgroundToggle: document.getElementById('background-toggle'),
    gridToggle: document.getElementById('grid-toggle'),
    designVariance: document.getElementById('design-variance'),
    presetSelect: document.getElementById('preset-select'),
    filterSelect: document.getElementById('filter-select'),
    outlineSlider: document.getElementById('outline-slider'),
    outlineColor: document.getElementById('outline-color'),
    hints: document.getElementById('hints')
  };

  const compositeCtx = dom.composite.getContext('2d', { alpha: false });
  const gridCtx = dom.grid.getContext('2d');

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  const outlineCanvas = document.createElement('canvas');
  const outlineCtx = outlineCanvas.getContext('2d');
  const maskWorkCanvas = document.createElement('canvas');
  const maskWorkCtx = maskWorkCanvas.getContext('2d');
  const backgroundCanvas = document.createElement('canvas');
  const backgroundCtx = backgroundCanvas.getContext('2d');

  const state = {
    stream: null,
    capturing: false,
    facingMode: 'environment',
    intervalMs: 750,
    bufferSize: 6,
    segmentationEnabled: true,
    backgroundFrozen: true,
    showGrid: false,
    designVariance: true,
    filter: 'none',
    outlineWidth: 4,
    outlineColor: '#ff3366',
    snapshots: [],
    captureTimeout: null,
    renderHandle: null,
    renderWidth: 1280,
    renderHeight: 720,
    videoReady: false,
    backgroundCaptured: false,
    segmentationStats: [],
    neonHueBase: 220,
    hintTimestamp: 0,
    videoDimensionHandler: null
  };

  class MediaPipeSegmenter {
    constructor() {
      this.supported = typeof SelfieSegmentation !== 'undefined';
      this.segmenter = null;
      this.ready = false;
      this.readyPromise = null;
      this.width = 0;
      this.height = 0;
      this.maskCanvas = null;
      this.maskCtx = null;
      this.tempCanvas = document.createElement('canvas');
      this.tempCtx = this.tempCanvas.getContext('2d');
      this.pending = false;
      this.pendingResolve = null;
      this.pendingReject = null;
    }

    setDimensions(width, height) {
      this.width = width;
      this.height = height;
      if (!this.supported) {
        return;
      }
      if (!this.maskCanvas) {
        this.maskCanvas = document.createElement('canvas');
        this.maskCtx = this.maskCanvas.getContext('2d');
      }
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.tempCanvas.width = width;
      this.tempCanvas.height = height;
    }

    async ensureInit() {
      if (!this.supported) {
        return false;
      }
      if (!this.segmenter) {
        this.segmenter = new SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });
        this.segmenter.setOptions({ modelSelection: 1, selfieMode: true });
        if (typeof this.segmenter.initialize === 'function') {
          this.readyPromise = this.segmenter.initialize()
            .then(() => {
              this.ready = true;
            })
            .catch((err) => {
              console.error('SelfieSegmentation 初期化に失敗:', err);
              this.supported = false;
            });
        } else {
          this.ready = true;
          this.readyPromise = Promise.resolve();
        }
        this.segmenter.onResults((results) => this.handleResults(results));
      }
      if (this.readyPromise) {
        await this.readyPromise;
      }
      return this.ready;
    }

    handleResults(results) {
      if (!this.pendingResolve) {
        this.pending = false;
        return;
      }
      try {
        this.maskCtx.save();
        this.maskCtx.globalCompositeOperation = 'copy';
        this.maskCtx.drawImage(results.segmentationMask, 0, 0, this.width, this.height);
        this.maskCtx.restore();

        const imageData = this.maskCtx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i];
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = alpha;
        }
        this.maskCtx.putImageData(imageData, 0, 0);

        this.tempCtx.save();
        this.tempCtx.clearRect(0, 0, this.width, this.height);
        this.tempCtx.filter = 'blur(1px)';
        this.tempCtx.drawImage(this.maskCanvas, 0, 0);
        this.tempCtx.restore();

        this.maskCtx.clearRect(0, 0, this.width, this.height);
        this.maskCtx.drawImage(this.tempCanvas, 0, 0);

        const clone = document.createElement('canvas');
        clone.width = this.width;
        clone.height = this.height;
        clone.getContext('2d').drawImage(this.maskCanvas, 0, 0);

        const resolve = this.pendingResolve;
        this.pendingResolve = null;
        this.pendingReject = null;
        this.pending = false;
        resolve(clone);
      } catch (error) {
        if (this.pendingReject) {
          this.pendingReject(error);
        }
        this.pendingResolve = null;
        this.pendingReject = null;
        this.pending = false;
      }
    }

    async segment(image) {
      if (!this.supported) {
        return null;
      }
      await this.ensureInit();
      if (!this.ready || this.pending) {
        return null;
      }
      this.pending = true;
      return new Promise(async (resolve, reject) => {
        this.pendingResolve = resolve;
        this.pendingReject = reject;
        try {
          await this.segmenter.send({ image });
        } catch (error) {
          this.pending = false;
          this.pendingResolve = null;
          this.pendingReject = null;
          reject(error);
        }
      });
    }

    isOperational() {
      return this.supported && this.ready;
    }
  }

  class BackgroundDiffer {
    constructor() {
      this.baseCanvas = document.createElement('canvas');
      this.baseCtx = this.baseCanvas.getContext('2d');
      this.previewMaskCanvas = document.createElement('canvas');
      this.previewMaskCtx = this.previewMaskCanvas.getContext('2d');
      this.maskCanvas = document.createElement('canvas');
      this.maskCtx = this.maskCanvas.getContext('2d');
      this.blurCanvas = document.createElement('canvas');
      this.blurCtx = this.blurCanvas.getContext('2d');
      this.backgroundData = null;
      this.width = 0;
      this.height = 0;
      this.threshold = 28;
    }

    setDimensions(width, height) {
      this.width = width;
      this.height = height;
      const targetWidth = width > 640 ? 320 : Math.round(width / 2);
      const targetHeight = Math.round((targetWidth / width) * height);
      this.baseCanvas.width = Math.max(1, targetWidth);
      this.baseCanvas.height = Math.max(1, targetHeight);
      this.previewMaskCanvas.width = this.baseCanvas.width;
      this.previewMaskCanvas.height = this.baseCanvas.height;
      this.maskCanvas.width = width;
      this.maskCanvas.height = height;
      this.blurCanvas.width = width;
      this.blurCanvas.height = height;
    }

    capture(video) {
      if (!this.width || !this.height) {
        return;
      }
      this.baseCtx.drawImage(video, 0, 0, this.baseCanvas.width, this.baseCanvas.height);
      this.backgroundData = this.baseCtx.getImageData(0, 0, this.baseCanvas.width, this.baseCanvas.height);
    }

    computeMask(bitmap) {
      if (!this.backgroundData) {
        return null;
      }
      this.baseCtx.drawImage(bitmap, 0, 0, this.baseCanvas.width, this.baseCanvas.height);
      const frame = this.baseCtx.getImageData(0, 0, this.baseCanvas.width, this.baseCanvas.height);
      const frameData = frame.data;
      const bgData = this.backgroundData.data;
      const maskImage = this.previewMaskCtx.createImageData(this.previewMaskCanvas.width, this.previewMaskCanvas.height);
      const maskData = maskImage.data;
      let activePixels = 0;
      for (let i = 0; i < frameData.length; i += 4) {
        const dr = frameData[i] - bgData[i];
        const dg = frameData[i + 1] - bgData[i + 1];
        const db = frameData[i + 2] - bgData[i + 2];
        const diff = Math.sqrt(dr * dr + dg * dg + db * db);
        const value = diff > this.threshold ? 255 : 0;
        if (value) {
          activePixels++;
        }
        maskData[i] = 255;
        maskData[i + 1] = 255;
        maskData[i + 2] = 255;
        maskData[i + 3] = value;
      }
      if (activePixels < this.previewMaskCanvas.width * this.previewMaskCanvas.height * 0.02) {
        return null;
      }
      this.previewMaskCtx.putImageData(maskImage, 0, 0);

      this.maskCtx.save();
      this.maskCtx.clearRect(0, 0, this.width, this.height);
      this.maskCtx.imageSmoothingEnabled = false;
      this.maskCtx.drawImage(this.previewMaskCanvas, 0, 0, this.width, this.height);
      this.maskCtx.restore();

      this.blurCtx.save();
      this.blurCtx.clearRect(0, 0, this.width, this.height);
      this.blurCtx.filter = 'blur(1px)';
      this.blurCtx.drawImage(this.maskCanvas, 0, 0);
      this.blurCtx.restore();

      this.maskCtx.clearRect(0, 0, this.width, this.height);
      this.maskCtx.drawImage(this.blurCanvas, 0, 0);

      const clone = document.createElement('canvas');
      clone.width = this.width;
      clone.height = this.height;
      clone.getContext('2d').drawImage(this.maskCanvas, 0, 0);
      return clone;
    }

    reset() {
      this.backgroundData = null;
    }
  }

  class CompositeRecorder {
    constructor(canvas, statusCallback) {
      this.canvas = canvas;
      this.statusCallback = statusCallback;
      this.mode = null;
      this.mediaRecorder = null;
      this.recordedBlobs = [];
      this.currentMimeType = 'video/webm';
      this.frames = [];
      this.frameInterval = 100;
      this.lastFrameTime = 0;
      this.capturePending = false;
    }

    isRecording() {
      return this.mode !== null;
    }

    isFrameCollectionActive() {
      return this.mode === 'frames';
    }

    async start() {
      if (this.mode) {
        return;
      }
      if (this.mediaRecorderSupported()) {
        try {
          this.startMediaRecorder();
          return;
        } catch (error) {
          console.warn('MediaRecorderが使用できなかったため連番保存に切り替えます', error);
          this.startFrameCollection();
        }
      } else {
        this.startFrameCollection();
      }
    }

    mediaRecorderSupported() {
      return typeof MediaRecorder !== 'undefined' && typeof this.canvas.captureStream === 'function';
    }

    startMediaRecorder() {
      const stream = this.canvas.captureStream(30);
      const optionsList = [
        { mimeType: 'video/webm;codecs=vp9' },
        { mimeType: 'video/webm;codecs=vp8' },
        { mimeType: 'video/webm' }
      ];
      let recorder = null;
      let mimeType = 'video/webm';
      for (const opt of optionsList) {
        if (MediaRecorder.isTypeSupported(opt.mimeType)) {
          recorder = new MediaRecorder(stream, opt);
          mimeType = opt.mimeType;
          break;
        }
      }
      if (!recorder) {
        this.startFrameCollection();
        return;
      }
      this.mode = 'media';
      this.mediaRecorder = recorder;
      this.recordedBlobs = [];
      this.currentMimeType = mimeType;
      this.statusCallback('WebM録画中…停止すると自動的に保存します。');
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(this.recordedBlobs, { type: this.currentMimeType });
        downloadBlob(blob, `kukkiri-trail-${Date.now()}.webm`);
        this.statusCallback('WebMファイルを保存しました。');
        this.mode = null;
        this.mediaRecorder = null;
        this.recordedBlobs = [];
      };
      recorder.start(1000);
    }

    startFrameCollection() {
      this.mode = 'frames';
      this.frames = [];
      this.lastFrameTime = 0;
      this.capturePending = false;
      this.statusCallback('WebM非対応のため静止画連番(約10fps)を収集中です。');
    }

    captureFrame() {
      if (this.mode !== 'frames') {
        return;
      }
      const now = performance.now();
      if (this.capturePending || (this.lastFrameTime && now - this.lastFrameTime < this.frameInterval)) {
        return;
      }
      this.lastFrameTime = now;
      this.capturePending = true;
      this.canvas.toBlob((blob) => {
        if (blob) {
          this.frames.push(blob);
        }
        this.capturePending = false;
      }, 'image/png', 0.92);
    }

    async stop() {
      if (!this.mode) {
        return;
      }
      if (this.mode === 'media') {
        const recorder = this.mediaRecorder;
        return new Promise((resolve) => {
          recorder.addEventListener(
            'stop',
            () => {
              this.mode = null;
              resolve();
            },
            { once: true }
          );
          recorder.stop();
        });
      }
      if (this.mode === 'frames') {
        await this.exportZip();
      }
    }

    async exportZip() {
      if (!this.frames.length) {
        this.statusCallback('保存するフレームがありませんでした。');
        this.mode = null;
        return;
      }
      if (typeof JSZip === 'undefined') {
        this.statusCallback('JSZipが利用できないためZIP出力に失敗しました。');
        this.mode = null;
        return;
      }
      const zip = new JSZip();
      let index = 0;
      for (const blob of this.frames) {
        const arrayBuffer = await blob.arrayBuffer();
        const filename = `frame-${String(index).padStart(4, '0')}.png`;
        zip.file(filename, arrayBuffer);
        index += 1;
      }
      const zipped = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipped, `kukkiri-trail-${Date.now()}.zip`);
      this.statusCallback(`静止画${this.frames.length}枚をZIPで保存しました。`);
      this.frames = [];
      this.mode = null;
    }
  }

  const segmenter = new MediaPipeSegmenter();
  const backgroundDiffer = new BackgroundDiffer();
  const recorder = new CompositeRecorder(dom.composite, (msg) => updateStatus(msg));

  function updateStatus(message) {
    dom.status.textContent = message;
  }

  function updateHints() {
    const hints = [];
    if (!state.backgroundCaptured && state.backgroundFrozen) {
      hints.push('背景固定中です。スタート後2秒ほど静止すると精度が上がります。');
    }
    if (!state.segmentationEnabled) {
      hints.push('人物切り抜きOFF: 背景差分モードで処理しています。');
    }
    if (!segmenter.supported) {
      hints.push('高精度セグメンテーションはこの環境で利用できません。');
    }
    if (state.filter === 'neon') {
      hints.push('暗めの背景と動きのあるポーズでネオンが映えます。');
    }
    if (state.snapshots.length < 2 && state.capturing) {
      hints.push('0.5〜1秒ごとにポーズを変えると残像が重なります。');
    }
    dom.hints.textContent = hints.join(' / ') || '明るい背景と被写体の距離(1.5m程度)を確保すると輪郭が安定します。';
  }

  function setCanvasSize(width, height) {
    state.renderWidth = width;
    state.renderHeight = height;
    dom.composite.width = width;
    dom.composite.height = height;
    dom.grid.width = width;
    dom.grid.height = height;
    tempCanvas.width = width;
    tempCanvas.height = height;
    outlineCanvas.width = width;
    outlineCanvas.height = height;
    maskWorkCanvas.width = width;
    maskWorkCanvas.height = height;
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    segmenter.setDimensions(width, height);
    backgroundDiffer.setDimensions(width, height);
    updateGrid();
  }

  function updateGrid() {
    gridCtx.clearRect(0, 0, dom.grid.width, dom.grid.height);
    if (!state.showGrid) {
      return;
    }
    const cols = 3;
    const rows = 3;
    gridCtx.save();
    gridCtx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    gridCtx.lineWidth = 1.2;
    gridCtx.setLineDash([12, 10]);
    for (let i = 1; i < cols; i += 1) {
      const x = (dom.grid.width / cols) * i;
      gridCtx.beginPath();
      gridCtx.moveTo(x, 0);
      gridCtx.lineTo(x, dom.grid.height);
      gridCtx.stroke();
    }
    for (let j = 1; j < rows; j += 1) {
      const y = (dom.grid.height / rows) * j;
      gridCtx.beginPath();
      gridCtx.moveTo(0, y);
      gridCtx.lineTo(dom.grid.width, y);
      gridCtx.stroke();
    }
    gridCtx.restore();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function waitForVideoReady(video) {
    if (video.readyState >= 2) {
      return;
    }
    await new Promise((resolve) => {
      video.addEventListener('loadeddata', resolve, { once: true });
    });
  }

  function isIOSSafari() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    return isIOS && isSafari;
  }

  function clearVideoDimensionHandler() {
    if (!state.videoDimensionHandler) {
      return;
    }
    dom.video.removeEventListener('loadedmetadata', state.videoDimensionHandler);
    dom.video.removeEventListener('resize', state.videoDimensionHandler);
    state.videoDimensionHandler = null;
  }

  function applyCanvasSizeFromVideo() {
    const width = dom.video.videoWidth;
    const height = dom.video.videoHeight;
    if (width > 0 && height > 0) {
      setCanvasSize(width, height);
      return true;
    }
    return false;
  }

  function ensureCanvasSizeMatchesVideo() {
    clearVideoDimensionHandler();
    if (applyCanvasSizeFromVideo()) {
      return;
    }
    setCanvasSize(1280, 720);
    const handler = () => {
      if (!applyCanvasSizeFromVideo()) {
        return;
      }
      clearVideoDimensionHandler();
    };
    state.videoDimensionHandler = handler;
    dom.video.addEventListener('loadedmetadata', handler);
    dom.video.addEventListener('resize', handler);
  }

  async function startCamera() {
    if (state.stream) {
      const [track] = state.stream.getVideoTracks();
      if (track && track.readyState === 'live') {
        dom.video.srcObject = state.stream;
        await dom.video.play();
        if (!state.videoReady) {
          await waitForVideoReady(dom.video);
          ensureCanvasSizeMatchesVideo();
          state.videoReady = true;
        }
        return state.stream;
      }
    }
    const videoConstraints = {
      width: { ideal: 1280 },
      facingMode: state.facingMode
    };
    if (isIOSSafari()) {
      videoConstraints.aspectRatio = { ideal: 4 / 3 };
    } else {
      videoConstraints.height = { ideal: 720 };
    }
    const constraints = {
      audio: false,
      video: videoConstraints
    };
    updateStatus('カメラ起動中…');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.stream = stream;
    dom.video.srcObject = stream;
    await dom.video.play();
    await waitForVideoReady(dom.video);
    ensureCanvasSizeMatchesVideo();
    state.videoReady = true;
    updateStatus('プレビュー準備完了。背景を固定しています…');
    return stream;
  }

  function captureBackground(auto = false) {
    if (!state.videoReady) {
      return;
    }
    backgroundCtx.save();
    backgroundCtx.globalCompositeOperation = 'copy';
    backgroundCtx.drawImage(dom.video, 0, 0, state.renderWidth, state.renderHeight);
    backgroundCtx.restore();
    backgroundDiffer.capture(dom.video);
    state.backgroundCaptured = true;
    if (!auto) {
      updateStatus('背景を再キャプチャしました。');
    }
    updateHints();
  }

  function clearSnapshots() {
    state.snapshots.forEach((snapshot) => {
      if (snapshot.bitmap && typeof snapshot.bitmap.close === 'function') {
        snapshot.bitmap.close();
      }
    });
    state.snapshots = [];
  }

  function computeSnapshotTransform() {
    if (!state.designVariance) {
      return { translateX: 0, translateY: 0, rotation: 0, scale: 1 };
    }
    const translateRange = 18;
    const rotationRange = (Math.PI / 180) * 3;
    const scaleRange = 0.05;
    return {
      translateX: (Math.random() - 0.5) * translateRange,
      translateY: (Math.random() - 0.5) * translateRange,
      rotation: (Math.random() - 0.5) * rotationRange * 2,
      scale: 1 + (Math.random() - 0.5) * scaleRange * 2
    };
  }

  function applyTransform(ctx, transform) {
    if (!transform) {
      return;
    }
    ctx.translate(state.renderWidth / 2, state.renderHeight / 2);
    ctx.translate(transform.translateX, transform.translateY);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-state.renderWidth / 2, -state.renderHeight / 2);
  }

  function drawMaskedFill(ctx, mask, painter) {
    maskWorkCtx.save();
    maskWorkCtx.clearRect(0, 0, state.renderWidth, state.renderHeight);
    painter(maskWorkCtx);
    maskWorkCtx.globalCompositeOperation = 'destination-in';
    maskWorkCtx.drawImage(mask, 0, 0, state.renderWidth, state.renderHeight);
    maskWorkCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(maskWorkCanvas, 0, 0);
    maskWorkCtx.restore();
  }

  function drawOutline(ctx, mask, color, width) {
    if (!mask || width <= 0) {
      return;
    }
    outlineCtx.save();
    outlineCtx.clearRect(0, 0, state.renderWidth, state.renderHeight);
    const blur = Math.max(0.6, width / 3);
    outlineCtx.filter = `blur(${blur}px)`;
    outlineCtx.drawImage(mask, 0, 0, state.renderWidth, state.renderHeight);
    outlineCtx.filter = 'none';
    outlineCtx.globalCompositeOperation = 'destination-out';
    outlineCtx.drawImage(mask, 0, 0, state.renderWidth, state.renderHeight);
    outlineCtx.globalCompositeOperation = 'source-in';
    outlineCtx.fillStyle = color;
    outlineCtx.globalAlpha = 0.9;
    outlineCtx.fillRect(0, 0, state.renderWidth, state.renderHeight);
    outlineCtx.globalCompositeOperation = 'source-over';
    outlineCtx.globalAlpha = 1;
    ctx.drawImage(outlineCanvas, 0, 0);
    outlineCtx.restore();
  }

  function applyPosterOverlay(ctx, mask) {
    drawMaskedFill(ctx, mask, (offscreen) => {
      const gradient = offscreen.createLinearGradient(0, 0, state.renderWidth, state.renderHeight);
      gradient.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.45)');
      offscreen.fillStyle = gradient;
      offscreen.fillRect(0, 0, state.renderWidth, state.renderHeight);
    });
  }

  function applyComicAccent(ctx, mask) {
    drawOutline(ctx, mask, '#0f172a', Math.max(state.outlineWidth, 6));
  }

  function applyNeonGlow(ctx, mask, index) {
    const hue = (state.neonHueBase + index * 40) % 360;
    drawMaskedFill(ctx, mask, (offscreen) => {
      offscreen.save();
      offscreen.fillStyle = `hsla(${hue}, 92%, 58%, 0.8)`;
      offscreen.filter = 'blur(24px)';
      offscreen.fillRect(0, 0, state.renderWidth, state.renderHeight);
      offscreen.restore();
    });
  }

  function drawSnapshot(ctx, snapshot, index) {
    const { bitmap, mask, transform } = snapshot;
    if (!bitmap || !mask) {
      return;
    }
    tempCtx.save();
    tempCtx.clearRect(0, 0, state.renderWidth, state.renderHeight);
    tempCtx.drawImage(bitmap, 0, 0, state.renderWidth, state.renderHeight);
    tempCtx.globalCompositeOperation = 'destination-in';
    tempCtx.drawImage(mask, 0, 0, state.renderWidth, state.renderHeight);
    tempCtx.restore();

    ctx.save();
    applyTransform(ctx, transform);
    switch (state.filter) {
      case 'poster':
        ctx.filter = 'saturate(1.35) contrast(1.35) brightness(1.05)';
        break;
      case 'comic':
        ctx.filter = 'contrast(1.8) saturate(0.95)';
        break;
      case 'neon':
        ctx.filter = 'saturate(1.8) brightness(1.05)';
        ctx.globalCompositeOperation = 'lighter';
        break;
      default:
        ctx.filter = 'none';
        break;
    }
    ctx.drawImage(tempCanvas, 0, 0, state.renderWidth, state.renderHeight);
    ctx.filter = 'none';
    if (state.filter === 'neon') {
      ctx.globalCompositeOperation = 'source-over';
    }

    if (state.filter === 'poster') {
      applyPosterOverlay(ctx, mask);
    } else if (state.filter === 'comic') {
      applyComicAccent(ctx, mask);
    } else if (state.filter === 'neon') {
      applyNeonGlow(ctx, mask, index);
    }

    ctx.restore();

    let outlineColor = state.outlineColor;
    let outlineWidth = state.outlineWidth;
    if (state.filter === 'neon') {
      outlineColor = `hsla(${(state.neonHueBase + index * 40) % 360}, 95%, 60%, 0.9)`;
      outlineWidth = Math.max(outlineWidth, 5);
    } else if (state.filter === 'comic') {
      outlineColor = '#0f172a';
      outlineWidth = Math.max(outlineWidth, 6);
    }
    drawOutline(ctx, mask, outlineColor, outlineWidth);
  }

  function renderComposite() {
    compositeCtx.save();
    compositeCtx.clearRect(0, 0, state.renderWidth, state.renderHeight);
    if (state.backgroundFrozen && state.backgroundCaptured) {
      compositeCtx.drawImage(backgroundCanvas, 0, 0, state.renderWidth, state.renderHeight);
    } else if (state.videoReady) {
      compositeCtx.drawImage(dom.video, 0, 0, state.renderWidth, state.renderHeight);
    } else {
      compositeCtx.fillStyle = '#0f172a';
      compositeCtx.fillRect(0, 0, state.renderWidth, state.renderHeight);
    }
    state.snapshots.forEach((snapshot, index) => {
      drawSnapshot(compositeCtx, snapshot, index);
    });
    compositeCtx.restore();

    recorder.captureFrame();
  }

  function startRenderLoop() {
    const loop = () => {
      if (!state.capturing) {
        return;
      }
      renderComposite();
      state.renderHandle = requestAnimationFrame(loop);
    };
    state.renderHandle = requestAnimationFrame(loop);
  }

  function stopRenderLoop() {
    if (state.renderHandle) {
      cancelAnimationFrame(state.renderHandle);
      state.renderHandle = null;
    }
  }

  function scheduleNextSnapshot() {
    clearTimeout(state.captureTimeout);
    if (!state.capturing) {
      return;
    }
    state.captureTimeout = setTimeout(() => {
      captureSnapshot().catch((error) => {
        console.error('captureSnapshot error', error);
        scheduleNextSnapshot();
      });
    }, state.intervalMs);
  }

  function recordSegmentationPerformance(duration) {
    if (!duration) {
      return;
    }
    state.segmentationStats.push(duration);
    if (state.segmentationStats.length > 12) {
      state.segmentationStats.shift();
    }
    const average = state.segmentationStats.reduce((acc, cur) => acc + cur, 0) / state.segmentationStats.length;
    if (average > 140 && state.bufferSize > 4) {
      state.bufferSize -= 1;
      dom.bufferSlider.value = state.bufferSize;
      dom.bufferLabel.textContent = `${state.bufferSize}`;
      trimSnapshots();
      updateStatus('処理負荷が高いため保持枚数を減らしました。');
    } else if (average > 110 && state.intervalMs < 1000) {
      state.intervalMs = Math.min(1000, state.intervalMs + 50);
      dom.intervalSlider.value = state.intervalMs;
      dom.intervalLabel.textContent = `${(state.intervalMs / 1000).toFixed(2)}s`;
      updateStatus('処理負荷が高いためインターバルを延長しました。');
    }
  }

  async function captureSnapshot() {
    if (!state.capturing || !state.videoReady) {
      return;
    }
    let bitmap = null;
    try {
      bitmap = await createImageBitmap(dom.video, 0, 0, state.renderWidth, state.renderHeight);
    } catch (error) {
      console.error('createImageBitmap failed', error);
      return;
    }
    if (!state.capturing) {
      if (bitmap && typeof bitmap.close === 'function') {
        bitmap.close();
      }
      return;
    }

    let maskCanvas = null;
    let segmentationUsed = false;
    if (state.segmentationEnabled) {
      const start = performance.now();
      try {
        const result = await segmenter.segment(dom.video);
        if (result) {
          maskCanvas = result;
          segmentationUsed = true;
          const duration = performance.now() - start;
          recordSegmentationPerformance(duration);
        }
      } catch (error) {
        console.warn('セグメンテーションに失敗しました', error);
      }
    }

    if (!maskCanvas && state.backgroundFrozen && state.backgroundCaptured) {
      maskCanvas = backgroundDiffer.computeMask(bitmap);
    }

    if (!maskCanvas) {
      if (!state.backgroundFrozen) {
        maskCanvas = createFullMask();
      } else {
        if (bitmap && typeof bitmap.close === 'function') {
          bitmap.close();
        }
        updateStatus('マスク生成に失敗したため、このフレームはスキップしました。');
        scheduleNextSnapshot();
        return;
      }
    }

    const snapshot = {
      bitmap,
      mask: maskCanvas,
      timestamp: Date.now(),
      transform: computeSnapshotTransform(),
      segmentationUsed
    };
    state.snapshots.push(snapshot);
    trimSnapshots();
    renderComposite();
    updateHints();
    scheduleNextSnapshot();
  }

  function createFullMask() {
    const canvas = document.createElement('canvas');
    canvas.width = state.renderWidth;
    canvas.height = state.renderHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function trimSnapshots() {
    while (state.snapshots.length > state.bufferSize) {
      const removed = state.snapshots.shift();
      if (removed.bitmap && typeof removed.bitmap.close === 'function') {
        removed.bitmap.close();
      }
    }
  }

  async function startSequence() {
    if (state.capturing) {
      return;
    }
    try {
      await startCamera();
    } catch (error) {
      updateStatus('カメラの取得に失敗しました。権限とHTTPS接続を確認してください。');
      return;
    }
    state.capturing = true;
    dom.startStop.textContent = '停止';
    dom.captureStill.disabled = false;
    dom.recordToggle.disabled = false;
    dom.recaptureBackground.disabled = false;
    clearSnapshots();
    captureBackground(true);
    setTimeout(() => captureBackground(true), 1200);
    setTimeout(() => captureBackground(true), 2200);
    updateHints();
    startRenderLoop();
    scheduleNextSnapshot();
    updateStatus('撮影中…動きを変えて残像を作成しましょう。');
  }

  async function stopSequence() {
    if (!state.capturing) {
      return;
    }
    state.capturing = false;
    clearTimeout(state.captureTimeout);
    stopRenderLoop();
    await recorder.stop();
    dom.recordToggle.textContent = '録画開始';
    dom.recordToggle.disabled = true;
    dom.captureStill.disabled = true;
    dom.recaptureBackground.disabled = true;
    clearSnapshots();
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      state.stream = null;
    }
    dom.video.srcObject = null;
    clearVideoDimensionHandler();
    state.videoReady = false;
    state.backgroundCaptured = false;
    backgroundDiffer.reset();
    updateStatus('撮影を停止しました。必要に応じて再開してください。');
    updateHints();
    dom.startStop.textContent = '撮影開始';
  }

  function applyPreset(presetKey) {
    const presets = {
      classic: {
        intervalMs: 750,
        bufferSize: 6,
        filter: 'none',
        outlineWidth: 4,
        outlineColor: '#ff3366',
        segmentation: true,
        designVariance: true
      },
      poster: {
        intervalMs: 700,
        bufferSize: 6,
        filter: 'poster',
        outlineWidth: 3,
        outlineColor: '#f1f5f9',
        segmentation: true,
        designVariance: true
      },
      comic: {
        intervalMs: 800,
        bufferSize: 5,
        filter: 'comic',
        outlineWidth: 7,
        outlineColor: '#0f172a',
        segmentation: true,
        designVariance: false
      },
      neon: {
        intervalMs: 650,
        bufferSize: 8,
        filter: 'neon',
        outlineWidth: 5,
        outlineColor: '#38bdf8',
        segmentation: true,
        designVariance: true
      }
    };
    const preset = presets[presetKey];
    if (!preset) {
      return;
    }
    state.intervalMs = preset.intervalMs;
    state.bufferSize = preset.bufferSize;
    state.filter = preset.filter;
    state.outlineWidth = preset.outlineWidth;
    state.outlineColor = preset.outlineColor;
    state.segmentationEnabled = preset.segmentation;
    if (!segmenter.supported) {
      state.segmentationEnabled = false;
    }
    state.designVariance = preset.designVariance;
    dom.intervalSlider.value = state.intervalMs;
    dom.bufferSlider.value = state.bufferSize;
    dom.filterSelect.value = state.filter;
    dom.outlineSlider.value = state.outlineWidth;
    dom.outlineColor.value = state.outlineColor;
    dom.segmentationToggle.checked = state.segmentationEnabled;
    dom.designVariance.checked = state.designVariance;
    dom.intervalLabel.textContent = `${(state.intervalMs / 1000).toFixed(2)}s`;
    dom.bufferLabel.textContent = `${state.bufferSize}`;
    trimSnapshots();
    updateHints();
    updateStatus(`プリセット「${dom.presetSelect.options[dom.presetSelect.selectedIndex].textContent}」を適用しました。`);
  }

  async function restartStream() {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    state.stream = null;
    state.videoReady = false;
    state.backgroundCaptured = false;
    clearTimeout(state.captureTimeout);
    clearSnapshots();
    backgroundDiffer.reset();
    await startCamera();
    if (state.capturing) {
      captureBackground(true);
      setTimeout(() => captureBackground(true), 1000);
      scheduleNextSnapshot();
    }
    updateHints();
    renderComposite();
  }

  function updateControlState() {
    dom.intervalLabel.textContent = `${(state.intervalMs / 1000).toFixed(2)}s`;
    dom.bufferLabel.textContent = `${state.bufferSize}`;
    dom.segmentationToggle.checked = state.segmentationEnabled;
    dom.backgroundToggle.checked = state.backgroundFrozen;
    dom.gridToggle.checked = state.showGrid;
    dom.designVariance.checked = state.designVariance;
    dom.filterSelect.value = state.filter;
    dom.outlineSlider.value = state.outlineWidth;
    dom.outlineColor.value = state.outlineColor;
  }

  function setupEventListeners() {
    dom.startStop.addEventListener('click', async () => {
      dom.startStop.disabled = true;
      if (state.capturing) {
        await stopSequence();
      } else {
        await startSequence();
      }
      dom.startStop.disabled = false;
    });

    dom.captureStill.addEventListener('click', () => {
      if (!state.capturing) {
        return;
      }
      dom.composite.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `kukkiri-still-${Date.now()}.png`);
          updateStatus('静止画を保存しました。');
        }
      }, 'image/png', 0.96);
    });

    dom.recordToggle.addEventListener('click', async () => {
      if (!state.capturing) {
        return;
      }
      dom.recordToggle.disabled = true;
      if (recorder.isRecording()) {
        await recorder.stop();
        dom.recordToggle.textContent = '録画開始';
      } else {
        await recorder.start();
        dom.recordToggle.textContent = '録画停止';
      }
      dom.recordToggle.disabled = false;
    });

    dom.switchCamera.addEventListener('click', async () => {
      state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
      if (!state.capturing) {
        updateStatus('次回の撮影開始時にカメラ向きが切り替わります。');
        return;
      }
      updateStatus('カメラを切り替えています…');
      dom.switchCamera.disabled = true;
      await restartStream();
      dom.switchCamera.disabled = false;
    });

    dom.recaptureBackground.addEventListener('click', () => {
      captureBackground(false);
    });

    dom.intervalSlider.addEventListener('input', (event) => {
      state.intervalMs = Number(event.target.value);
      dom.intervalLabel.textContent = `${(state.intervalMs / 1000).toFixed(2)}s`;
      scheduleNextSnapshot();
    });

    dom.bufferSlider.addEventListener('input', (event) => {
      state.bufferSize = Number(event.target.value);
      dom.bufferLabel.textContent = `${state.bufferSize}`;
      trimSnapshots();
      renderComposite();
    });

    dom.segmentationToggle.addEventListener('change', async (event) => {
      state.segmentationEnabled = event.target.checked;
      if (state.segmentationEnabled && !segmenter.supported) {
        state.segmentationEnabled = false;
        dom.segmentationToggle.checked = false;
        updateStatus('人物セグメンテーションはこの環境では利用できません。');
      }
      if (state.segmentationEnabled) {
        await segmenter.ensureInit();
        updateStatus('人物切り抜きを有効化しました。');
      } else {
        updateStatus('人物切り抜きを無効化しました。背景差分または全体積層で動作します。');
      }
      updateHints();
    });

    dom.backgroundToggle.addEventListener('change', (event) => {
      state.backgroundFrozen = event.target.checked;
      if (state.backgroundFrozen) {
        captureBackground(false);
      } else {
        updateStatus('背景をライブ表示に切り替えました。');
      }
      renderComposite();
      updateHints();
    });

    dom.gridToggle.addEventListener('change', (event) => {
      state.showGrid = event.target.checked;
      updateGrid();
    });

    dom.designVariance.addEventListener('change', (event) => {
      state.designVariance = event.target.checked;
    });

    dom.filterSelect.addEventListener('change', (event) => {
      state.filter = event.target.value;
      renderComposite();
      updateHints();
    });

    dom.outlineSlider.addEventListener('input', (event) => {
      state.outlineWidth = Number(event.target.value);
      renderComposite();
    });

    dom.outlineColor.addEventListener('input', (event) => {
      state.outlineColor = event.target.value;
      renderComposite();
    });

    dom.presetSelect.addEventListener('change', (event) => {
      applyPreset(event.target.value);
      renderComposite();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.capturing) {
        stopSequence();
      }
    });

    window.addEventListener('beforeunload', () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  function initialize() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      updateStatus('このブラウザはカメラ取得に対応していません。最新のブラウザをご利用ください。');
      dom.startStop.disabled = true;
      return;
    }
    if (!segmenter.supported) {
      state.segmentationEnabled = false;
      dom.segmentationToggle.checked = false;
      dom.segmentationToggle.disabled = true;
      updateStatus('人物セグメンテーションライブラリを読み込めなかったため背景差分モードで動作します。');
    }
    setCanvasSize(state.renderWidth, state.renderHeight);
    updateControlState();
    updateHints();
    setupEventListeners();
    renderComposite();
  }

  initialize();
})();
