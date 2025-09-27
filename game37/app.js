class EchoCameraApp {
    constructor() {
        this.video = document.getElementById('video');
        this.mainCanvas = document.getElementById('main-canvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        
        // UI elements
        this.cameraBtn = document.getElementById('camera-btn');
        this.flipBtn = document.getElementById('flip-btn');
        this.torchBtn = document.getElementById('torch-btn');
        this.recordBtn = document.getElementById('record-btn');
        this.framerateSelect = document.getElementById('framerate-select');
        this.opacitySlider = document.getElementById('opacity-slider');
        this.intervalSlider = document.getElementById('interval-slider');
        this.cyclesSlider = document.getElementById('cycles-slider');
        this.opacityValue = document.getElementById('opacity-value');
        this.intervalValue = document.getElementById('interval-value');
        this.cyclesValue = document.getElementById('cycles-value');
        this.statusText = document.getElementById('status-text');
        this.errorBox = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        
        // State management
        this.stream = null;
        this.recorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.isCameraActive = false;
        this.facingMode = 'user';
        this.isTorchOn = false;
        this.animationId = null;
        
        // Frame rate control
        this.currentFps = 30;
        this.frameInterval = 1000 / this.currentFps;
        this.lastFrameTime = 0;
        
        // Dynamic echo effect settings
        this.baseOpacity = 0.6;
        this.frameStep = 12;
        this.echoCycles = 5;
        this.bufferSize = 160;
        
        // Frame buffer (circular buffer)
        this.frameBuffer = new Array(this.bufferSize);
        this.frameCount = 0;
        this.bufferCanvases = [];
        
        // Create buffer canvases
        for (let i = 0; i < this.bufferSize; i++) {
            const canvas = document.createElement('canvas');
            this.bufferCanvases[i] = canvas;
            this.frameBuffer[i] = {
                canvas: canvas,
                ctx: canvas.getContext('2d'),
                frameNumber: -1
            };
        }
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.updateStatus('準備完了 - 設定を調整してカメラを開始');
        window.addEventListener('resize', () => this.setupCanvas());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.setupCanvas(), 300);
        });
    }
    
    setupEventListeners() {
        this.cameraBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCamera();
        });
        
        this.flipBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.flipCamera();
        });
        
        this.torchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTorch();
        });
        
        this.recordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleRecording();
        });
        
        this.framerateSelect.addEventListener('change', () => this.updateFrameRate());
        
        // Slider event listeners
        this.opacitySlider.addEventListener('input', () => this.updateOpacity());
        this.intervalSlider.addEventListener('input', () => this.updateInterval());
        this.cyclesSlider.addEventListener('input', () => this.updateCycles());
    }
    
    updateOpacity() {
        this.baseOpacity = parseFloat(this.opacitySlider.value);
        this.opacityValue.textContent = this.baseOpacity;
    }
    
    updateInterval() {
        this.frameStep = parseInt(this.intervalSlider.value);
        this.intervalValue.textContent = this.frameStep;
    }
    
    updateCycles() {
        this.echoCycles = parseInt(this.cyclesSlider.value);
        this.cyclesValue.textContent = this.echoCycles;
    }
    
    setupCanvas() {
        const container = this.mainCanvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set iPhone optimized dimensions
        let canvasWidth, canvasHeight;
        
        if (window.innerHeight > window.innerWidth) {
            // Portrait mode - 3:4 aspect ratio optimized for iPhone
            canvasWidth = Math.min(rect.width - 20, 360);
            canvasHeight = Math.round((canvasWidth * 4) / 3);
        } else {
            // Landscape mode - 16:9 aspect ratio
            canvasHeight = Math.min(rect.height - 20, 270);
            canvasWidth = Math.round((canvasHeight * 16) / 9);
        }
        
        // Set canvas dimensions
        this.mainCanvas.width = canvasWidth;
        this.mainCanvas.height = canvasHeight;
        this.mainCanvas.style.width = canvasWidth + 'px';
        this.mainCanvas.style.height = canvasHeight + 'px';
        
        // Update buffer canvases
        for (let canvas of this.bufferCanvases) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        }
        
        // Clear canvas with black background
        this.mainCtx.fillStyle = '#000000';
        this.mainCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    async toggleCamera() {
        if (this.isCameraActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }
    
    async startCamera() {
        try {
            this.updateStatus('カメラを起動中...');
            
            // Stop existing streams first
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            // iOS Safari compatible constraints
            const constraints = {
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 960 }
                },
                audio: false
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Set video element properties for better compatibility
            this.video.srcObject = this.stream;
            this.video.muted = true;
            this.video.playsInline = true;
            this.video.autoplay = true;
            
            // Wait for video to be ready and start playing
            await new Promise((resolve, reject) => {
                const onLoadedData = () => {
                    this.video.removeEventListener('loadeddata', onLoadedData);
                    this.video.removeEventListener('error', onError);
                    resolve();
                };
                
                const onError = (error) => {
                    this.video.removeEventListener('loadeddata', onLoadedData);
                    this.video.removeEventListener('error', onError);
                    reject(error);
                };
                
                this.video.addEventListener('loadeddata', onLoadedData);
                this.video.addEventListener('error', onError);
                
                // Start playing
                this.video.play().catch(reject);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (!this.isCameraActive) {
                        this.video.removeEventListener('loadeddata', onLoadedData);
                        this.video.removeEventListener('error', onError);
                        reject(new Error('Camera timeout'));
                    }
                }, 10000);
            });
            
            this.isCameraActive = true;
            this.updateCameraButton();
            this.enableControls();
            this.updateStatus('カメラアクティブ - 手を動かして残像効果を確認！');
            
            this.startRenderLoop();
            this.hideError();
            
        } catch (error) {
            console.error('Camera error:', error);
            this.handleCameraError(error);
        }
    }
    
    stopCamera() {
        // Stop animation loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording();
        }
        
        // Stop media stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.isCameraActive = false;
        
        this.updateCameraButton();
        this.disableControls();
        this.updateStatus('カメラ停止');
        
        // Clear canvas
        this.mainCtx.fillStyle = '#000000';
        this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // Reset frame count
        this.frameCount = 0;
        for (let buffer of this.frameBuffer) {
            buffer.frameNumber = -1;
        }
    }
    
    async flipCamera() {
        if (!this.isCameraActive) return;
        
        this.updateStatus('カメラ切替中...');
        this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
        
        // Restart camera with new facing mode
        this.stopCamera();
        setTimeout(() => this.startCamera(), 100);
    }
    
    async toggleTorch() {
        if (!this.stream) return;
        
        try {
            const track = this.stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.();
            
            if (capabilities && 'torch' in capabilities) {
                this.isTorchOn = !this.isTorchOn;
                await track.applyConstraints({
                    advanced: [{ torch: this.isTorchOn }]
                });
                this.updateTorchButton();
                this.updateStatus(this.isTorchOn ? 'トーチ オン' : 'トーチ オフ');
            } else {
                this.showError('トーチはサポートされていません');
            }
        } catch (error) {
            this.showError('トーチエラー');
            console.error('Torch error:', error);
        }
    }
    
    updateFrameRate() {
        this.currentFps = parseInt(this.framerateSelect.value);
        this.frameInterval = 1000 / this.currentFps;
        this.updateStatus(`フレームレート: ${this.currentFps} fps`);
    }
    
    startRenderLoop() {
        const render = (timestamp) => {
            if (!this.isCameraActive) return;
            
            // Check if enough time has passed for next frame
            if (timestamp - this.lastFrameTime >= this.frameInterval) {
                this.processFrame();
                this.lastFrameTime = timestamp;
            }
            
            this.animationId = requestAnimationFrame(render);
        };
        
        this.lastFrameTime = performance.now();
        this.animationId = requestAnimationFrame(render);
    }
    
    processFrame() {
        // Check if video is ready
        if (!this.video || this.video.readyState < 2 || this.video.videoWidth === 0) {
            return;
        }
        
        const bufferIndex = this.frameCount % this.bufferSize;
        const currentBuffer = this.frameBuffer[bufferIndex];
        
        try {
            // Draw current video frame to buffer canvas
            currentBuffer.ctx.drawImage(
                this.video, 
                0, 0, 
                currentBuffer.canvas.width, 
                currentBuffer.canvas.height
            );
            currentBuffer.frameNumber = this.frameCount;
            
            // Render echo effect to main canvas
            this.renderEchoEffect();
            
            this.frameCount++;
            
        } catch (error) {
            console.error('Frame processing error:', error);
        }
    }
    
    renderEchoEffect() {
        // Clear main canvas
        this.mainCtx.fillStyle = '#000000';
        this.mainCtx.fillRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        
        // Generate dynamic opacity values
        const opacities = [];
        for (let i = 0; i < this.echoCycles; i++) {
            if (i === this.echoCycles - 1) {
                opacities.push(1.0); // Current frame is always fully opaque
            } else {
                // Gradually increase opacity from baseOpacity towards 0.9
                const progress = i / Math.max(this.echoCycles - 2, 1);
                const opacity = this.baseOpacity + (0.9 - this.baseOpacity) * progress;
                opacities.push(Math.min(opacity, 0.9));
            }
        }
        
        // Draw echo frames (oldest first for proper layering)
        for (let cycle = this.echoCycles - 1; cycle >= 0; cycle--) {
            const frameOffset = cycle * this.frameStep;
            const targetFrameNumber = this.frameCount - frameOffset;
            
            if (targetFrameNumber >= 0) {
                const bufferIndex = targetFrameNumber % this.bufferSize;
                const buffer = this.frameBuffer[bufferIndex];
                
                if (buffer.frameNumber === targetFrameNumber) {
                    this.mainCtx.save();
                    this.mainCtx.globalAlpha = opacities[cycle];
                    this.mainCtx.drawImage(buffer.canvas, 0, 0);
                    this.mainCtx.restore();
                }
            }
        }
    }
    
    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }
    
    getSupportedMimeType() {
        const types = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
            'video/mp4'
        ];
        
        for (let type of types) {
            if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return 'video/webm';
    }
    
    async startRecording() {
        try {
            if (!this.isCameraActive) {
                this.showError('最初にカメラを開始してください');
                return;
            }
            
            // Create stream from canvas
            const canvasStream = this.mainCanvas.captureStream(this.currentFps);
            
            const mimeType = this.getSupportedMimeType();
            const options = {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000
            };
            
            this.recorder = new MediaRecorder(canvasStream, options);
            this.recordedChunks = [];
            
            this.recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.recorder.onstop = () => {
                this.saveRecording(mimeType);
            };
            
            this.recorder.onerror = (error) => {
                console.error('Recording error:', error);
                this.showError('録画エラーが発生しました');
                this.isRecording = false;
                this.updateRecordButton();
            };
            
            this.recorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.updateRecordButton();
            this.updateStatus('残像効果を録画中...');
            
        } catch (error) {
            console.error('Start recording error:', error);
            this.showError('録画開始に失敗しました');
        }
    }
    
    stopRecording() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            try {
                this.recorder.stop();
            } catch (error) {
                console.error('Stop recording error:', error);
            }
        }
        
        this.isRecording = false;
        this.updateRecordButton();
        this.updateStatus('録画を停止中...');
    }
    
    saveRecording(mimeType) {
        if (this.recordedChunks.length === 0) {
            this.showError('録画データがありません');
            return;
        }
        
        try {
            const blob = new Blob(this.recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `echo-camera-${timestamp}.${extension}`;
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.updateStatus(`保存完了: ${filename}`);
            
            // Reset status after 3 seconds
            setTimeout(() => {
                if (this.isCameraActive) {
                    this.updateStatus('カメラアクティブ - 手を動かして残像効果を確認！');
                }
            }, 3000);
            
        } catch (error) {
            console.error('Save recording error:', error);
            this.showError('録画の保存に失敗しました');
        }
    }
    
    // UI Update Methods
    updateCameraButton() {
        const btnText = this.cameraBtn.querySelector('.btn-text');
        const btnIcon = this.cameraBtn.querySelector('.btn-icon');
        if (this.isCameraActive) {
            btnText.textContent = 'Stop Camera';
            btnIcon.textContent = '⏹️';
        } else {
            btnText.textContent = 'Start Camera';
            btnIcon.textContent = '📷';
        }
    }
    
    updateTorchButton() {
        if (this.isTorchOn) {
            this.torchBtn.classList.add('torch-active');
        } else {
            this.torchBtn.classList.remove('torch-active');
        }
    }
    
    updateRecordButton() {
        const btnText = this.recordBtn.querySelector('.btn-text');
        const btnIcon = this.recordBtn.querySelector('.btn-icon');
        if (this.isRecording) {
            this.recordBtn.classList.add('recording');
            btnText.textContent = 'Stop';
            btnIcon.textContent = '⏹️';
        } else {
            this.recordBtn.classList.remove('recording');
            btnText.textContent = 'Record';
            btnIcon.textContent = '⚫';
        }
    }
    
    enableControls() {
        this.flipBtn.disabled = false;
        this.torchBtn.disabled = false;
        this.recordBtn.disabled = false;
    }
    
    disableControls() {
        this.flipBtn.disabled = true;
        this.torchBtn.disabled = true;
        this.recordBtn.disabled = true;
        this.torchBtn.classList.remove('torch-active');
        this.isTorchOn = false;
    }
    
    updateStatus(text) {
        this.statusText.textContent = text;
    }
    
    showError(message) {
        this.errorText.textContent = message;
        this.errorBox.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideError();
        }, 4000);
    }
    
    hideError() {
        this.errorBox.classList.add('hidden');
    }
    
    handleCameraError(error) {
        let errorMessage = 'カメラエラー: ';
        
        switch (error.name) {
            case 'NotAllowedError':
                errorMessage += 'カメラアクセスが拒否されました。ブラウザの設定でカメラを許可してください。';
                break;
            case 'NotFoundError':
                errorMessage += 'カメラデバイスが見つかりません。';
                break;
            case 'NotSupportedError':
                errorMessage += 'カメラがサポートされていません。';
                break;
            case 'NotReadableError':
                errorMessage += 'カメラが他のアプリケーションで使用中です。';
                break;
            case 'OverconstrainedError':
                errorMessage += 'カメラの制約が満たせません。';
                break;
            case 'SecurityError':
                errorMessage += 'セキュリティエラー。HTTPSが必要です。';
                break;
            default:
                errorMessage += error.message || '不明なエラーが発生しました';
        }
        
        this.showError(errorMessage);
        this.updateStatus('カメラエラー');
        console.error('Camera error details:', error);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for basic browser support
    if (!navigator.mediaDevices?.getUserMedia) {
        document.getElementById('error-text').textContent = 'このブラウザはカメラAPIをサポートしていません';
        document.getElementById('error-message').classList.remove('hidden');
        return;
    }
    
    if (!window.MediaRecorder) {
        document.getElementById('error-text').textContent = 'このブラウザは録画機能をサポートしていません';
        document.getElementById('error-message').classList.remove('hidden');
        return;
    }
    
    try {
        window.echoCameraApp = new EchoCameraApp();
    } catch (error) {
        console.error('App initialization error:', error);
        document.getElementById('error-text').textContent = 'アプリの初期化に失敗しました';
        document.getElementById('error-message').classList.remove('hidden');
    }
});