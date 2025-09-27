class RainbowCameraApp {
    constructor() {
        // DOM Elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // UI Elements
        this.startBtn = document.getElementById('startBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.switchCamera = document.getElementById('switchCamera');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.intensitySlider = document.getElementById('intensity');
        this.hueSlider = document.getElementById('hue');
        this.lengthSlider = document.getElementById('length');
        this.intensityValue = document.getElementById('intensityValue');
        this.hueValue = document.getElementById('hueValue');
        this.lengthValue = document.getElementById('lengthValue');
        this.fpsDisplay = document.getElementById('fpsDisplay');
        this.recordingTime = document.getElementById('recordingTime');
        this.recordingIndicator = document.getElementById('recordingIndicator');
        
        // Modals
        this.startScreen = document.getElementById('startScreen');
        this.controls = document.getElementById('controls');
        this.permissionModal = document.getElementById('permissionModal');
        this.errorModal = document.getElementById('errorModal');
        this.errorText = document.getElementById('errorText');
        
        // Camera state
        this.stream = null;
        this.facingMode = 'user';
        this.isActive = false;
        this.videoReady = false;
        
        // Recording state
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.recordingStartTime = 0;
        this.recordedBlob = null;
        
        // Effect parameters from data
        this.effectIntensity = 0.7; // 70%
        this.hueSpeed = 0.2; // 20%
        this.trailLength = 8; // 8 frames
        
        // Animation state
        this.animationId = null;
        this.lastTime = 0;
        this.frameBuffer = [];
        this.time = 0;
        
        // Performance tracking
        this.fpsCounter = 0;
        this.lastFpsTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkSupport();
    }
    
    checkSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('このブラウザはカメラをサポートしていません');
            return false;
        }
        return true;
    }
    
    setupEventListeners() {
        // Main buttons
        this.startBtn.addEventListener('click', () => this.requestPermission());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.switchCamera.addEventListener('click', () => this.switchCameraFacing());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        
        // Sliders
        this.intensitySlider.addEventListener('input', (e) => {
            this.effectIntensity = parseInt(e.target.value) / 100;
            this.intensityValue.textContent = e.target.value + '%';
        });
        
        this.hueSlider.addEventListener('input', (e) => {
            this.hueSpeed = parseInt(e.target.value) / 100;
            this.hueValue.textContent = e.target.value + '%';
        });
        
        this.lengthSlider.addEventListener('input', (e) => {
            this.trailLength = parseInt(e.target.value);
            this.lengthValue.textContent = e.target.value;
            // Clear buffer when length changes
            this.frameBuffer = [];
        });
        
        // Modal buttons
        document.getElementById('allowBtn').addEventListener('click', () => {
            this.permissionModal.classList.add('hidden');
            this.startCamera();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.permissionModal.classList.add('hidden');
        });
        
        document.getElementById('closeErrorBtn').addEventListener('click', () => {
            this.errorModal.classList.add('hidden');
        });
        
        // Video events
        this.video.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded');
            this.setupCanvas();
        });
        
        this.video.addEventListener('canplay', () => {
            console.log('Video can play');
            this.onVideoReady();
        });
        
        this.video.addEventListener('playing', () => {
            console.log('Video playing');
            this.videoReady = true;
        });
        
        this.video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.showError('ビデオエラーが発生しました');
        });
        
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 300);
        });
    }
    
    requestPermission() {
        this.permissionModal.classList.remove('hidden');
    }
    
    async startCamera() {
        try {
            console.log('Starting camera with facing mode:', this.facingMode);
            
            // Simple, compatible constraints
            const constraints = {
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 }
                },
                audio: true
            };
            
            // Stop existing stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Stream obtained');
            
            this.video.srcObject = this.stream;
            this.video.muted = true;
            
            // Ensure video plays
            try {
                await this.video.play();
                console.log('Video play successful');
            } catch (playError) {
                console.error('Play error:', playError);
                // Try again after a short delay
                setTimeout(async () => {
                    try {
                        await this.video.play();
                    } catch (retryError) {
                        this.showError('ビデオ再生に失敗しました');
                    }
                }, 100);
            }
            
        } catch (error) {
            console.error('Camera error:', error);
            this.handleCameraError(error);
        }
    }
    
    handleCameraError(error) {
        let message = 'カメラアクセスエラー';
        
        switch (error.name) {
            case 'NotAllowedError':
                message = 'カメラアクセスが拒否されました。ブラウザの設定を確認してください。';
                break;
            case 'NotFoundError':
                message = 'カメラが見つかりません';
                break;
            case 'NotReadableError':
                message = 'カメラが他のアプリで使用中です';
                break;
            case 'OverconstrainedError':
                message = 'カメラの設定が対応していません';
                break;
            default:
                message = `エラー: ${error.message}`;
        }
        
        this.showError(message);
    }
    
    onVideoReady() {
        console.log('Video ready, starting effects');
        
        if (!this.animationId) {
            this.startAnimation();
        }
        
        this.isActive = true;
        this.videoReady = true;
        
        // Hide start screen, show controls
        this.startScreen.classList.add('hidden');
        this.controls.classList.remove('hidden');
    }
    
    setupCanvas() {
        // Wait for video to have dimensions
        if (this.video.videoWidth === 0 || this.video.videoHeight === 0) {
            setTimeout(() => this.setupCanvas(), 100);
            return;
        }
        
        const container = this.video.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set canvas to container size
        this.canvas.width = containerRect.width;
        this.canvas.height = containerRect.height;
        
        console.log('Canvas setup:', containerRect.width, 'x', containerRect.height);
        console.log('Video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);
        
        // Initialize frame buffer
        this.frameBuffer = [];
    }
    
    handleResize() {
        if (this.isActive) {
            setTimeout(() => this.setupCanvas(), 100);
        }
    }
    
    startAnimation() {
        const animate = (timestamp) => {
            this.time = timestamp * 0.001;
            
            if (timestamp - this.lastTime >= 1000 / 30) { // 30 FPS target
                this.renderFrame();
                this.updateFPS(timestamp);
                this.lastTime = timestamp;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        console.log('Starting animation loop');
        this.animationId = requestAnimationFrame(animate);
    }
    
    renderFrame() {
        if (!this.videoReady || !this.video || this.video.readyState < 2) {
            return;
        }
        
        const { width, height } = this.canvas;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw current video frame
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.video, 0, 0, width, height);
        
        // Apply rainbow trail effect
        if (this.effectIntensity > 0 && this.trailLength > 1) {
            this.applyRainbowTrail();
        }
    }
    
    applyRainbowTrail() {
        const { width, height } = this.canvas;
        
        try {
            // Get current frame data
            const currentFrame = this.ctx.getImageData(0, 0, width, height);
            
            // Add to frame buffer
            this.frameBuffer.push({
                data: new ImageData(
                    new Uint8ClampedArray(currentFrame.data),
                    width,
                    height
                ),
                timestamp: this.time
            });
            
            // Limit buffer size
            if (this.frameBuffer.length > this.trailLength) {
                this.frameBuffer.shift();
            }
            
            // Only apply trail effect if we have multiple frames
            if (this.frameBuffer.length > 1) {
                // Clear canvas
                this.ctx.clearRect(0, 0, width, height);
                
                // Draw trail frames with rainbow effect
                this.frameBuffer.forEach((frame, index) => {
                    const age = this.frameBuffer.length - index - 1;
                    const alpha = Math.max(0.1, 1 - (age / this.trailLength));
                    const intensity = alpha * this.effectIntensity;
                    
                    if (intensity > 0.05) {
                        const processedFrame = this.applyRainbowEffect(frame.data, age);
                        
                        // Set compositing for trail effect
                        if (index === this.frameBuffer.length - 1) {
                            // Current frame - normal blend
                            this.ctx.globalCompositeOperation = 'source-over';
                            this.ctx.globalAlpha = 1;
                        } else {
                            // Trail frames - additive blend
                            this.ctx.globalCompositeOperation = 'lighter';
                            this.ctx.globalAlpha = intensity;
                        }
                        
                        // Create temporary canvas for processed frame
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = width;
                        tempCanvas.height = height;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.putImageData(processedFrame, 0, 0);
                        
                        this.ctx.drawImage(tempCanvas, 0, 0);
                    }
                });
                
                // Reset compositing
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.globalAlpha = 1;
            }
            
        } catch (error) {
            console.error('Trail effect error:', error);
            // Fallback: just draw the video
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(this.video, 0, 0, width, height);
        }
    }
    
    applyRainbowEffect(imageData, frameAge) {
        const data = new Uint8ClampedArray(imageData.data);
        const { width } = imageData;
        
        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Original RGB
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate hue based on position, time, and frame age
            const positionHue = (x / width + y / imageData.height) * 180;
            const timeHue = this.time * this.hueSpeed * 50;
            const ageHue = frameAge * 30;
            const totalHue = (positionHue + timeHue + ageHue) % 360;
            
            // Convert to HSV
            const [h, s, v] = this.rgbToHsv(r, g, b);
            
            // Apply rainbow effect
            const newH = totalHue / 360;
            const newS = Math.min(1, s + this.effectIntensity * 0.4);
            const newV = Math.min(1, v * (0.8 + this.effectIntensity * 0.2));
            
            // Convert back to RGB
            const [newR, newG, newB] = this.hsvToRgb(newH, newS, newV);
            
            // Mix with original based on brightness
            const brightness = (r + g + b) / 3;
            const mixFactor = (brightness / 255) * this.effectIntensity;
            
            data[i] = Math.round(r * (1 - mixFactor) + newR * mixFactor);
            data[i + 1] = Math.round(g * (1 - mixFactor) + newG * mixFactor);
            data[i + 2] = Math.round(b * (1 - mixFactor) + newB * mixFactor);
        }
        
        return new ImageData(data, imageData.width, imageData.height);
    }
    
    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const v = max;
        const s = max === 0 ? 0 : diff / max;
        
        let h = 0;
        if (diff !== 0) {
            if (max === r) h = ((g - b) / diff) % 6;
            else if (max === g) h = (b - r) / diff + 2;
            else h = (r - g) / diff + 4;
        }
        h = (h / 6 + 1) % 1;
        
        return [h, s, v];
    }
    
    hsvToRgb(h, s, v) {
        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;
        
        let r = 0, g = 0, b = 0;
        const hSix = h * 6;
        
        if (hSix < 1) { r = c; g = x; b = 0; }
        else if (hSix < 2) { r = x; g = c; b = 0; }
        else if (hSix < 3) { r = 0; g = c; b = x; }
        else if (hSix < 4) { r = 0; g = x; b = c; }
        else if (hSix < 5) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    }
    
    async switchCameraFacing() {
        if (!this.isActive || this.isRecording) return;
        
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        console.log('Switching camera to:', this.facingMode);
        
        this.videoReady = false;
        await this.startCamera();
    }
    
    async toggleRecording() {
        if (!this.isActive) return;
        
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            // Create stream from canvas
            const canvasStream = this.canvas.captureStream(30);
            
            // Add audio track if available
            const audioTrack = this.stream?.getAudioTracks()[0];
            if (audioTrack) {
                canvasStream.addTrack(audioTrack);
            }
            
            // Setup MediaRecorder with fallbacks
            let options = { videoBitsPerSecond: 3000000 };
            
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                options.mimeType = 'video/webm;codecs=vp8,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                options.mimeType = 'video/webm';
            }
            
            this.mediaRecorder = new MediaRecorder(canvasStream, options);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { 
                    type: this.mediaRecorder.mimeType || 'video/webm' 
                });
                this.recordedBlob = blob;
                this.downloadBtn.classList.remove('hidden');
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Update UI
            this.recordBtn.classList.add('recording');
            this.recordingIndicator.classList.remove('hidden');
            this.updateRecordingTime();
            
        } catch (error) {
            console.error('Recording error:', error);
            this.showError('録画開始エラー: ' + error.message);
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Update UI
            this.recordBtn.classList.remove('recording');
            this.recordingIndicator.classList.add('hidden');
        }
    }
    
    updateRecordingTime() {
        if (!this.isRecording) return;
        
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        this.recordingTime.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.isRecording) {
            setTimeout(() => this.updateRecordingTime(), 1000);
        }
    }
    
    downloadVideo() {
        if (!this.recordedBlob) return;
        
        const url = URL.createObjectURL(this.recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rainbow-camera-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Hide download button after use
        this.downloadBtn.classList.add('hidden');
    }
    
    updateFPS(timestamp) {
        this.fpsCounter++;
        if (timestamp - this.lastFpsTime >= 1000) {
            this.fpsDisplay.textContent = `${this.fpsCounter} FPS`;
            this.fpsCounter = 0;
            this.lastFpsTime = timestamp;
        }
    }
    
    showError(message) {
        console.error('Error:', message);
        this.errorText.textContent = message;
        this.errorModal.classList.remove('hidden');
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Rainbow Camera App');
    window.rainbowCamera = new RainbowCameraApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.rainbowCamera) {
        window.rainbowCamera.destroy();
    }
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.rainbowCamera?.isRecording) {
        window.rainbowCamera.stopRecording();
    }
});