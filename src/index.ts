interface VideoData {
    file: File;
    element: HTMLVideoElement;
    url: string;
}

interface GlobalElements {
    playAllBtn: HTMLButtonElement;
    pauseAllBtn: HTMLButtonElement;
    syncBtn: HTMLButtonElement;
    fullscreenBtn: HTMLButtonElement;
    clearAllBtn: HTMLButtonElement;
    infoPanel: HTMLDivElement;
    infoGrid: HTMLDivElement;
}

class PanoramicDashcamViewer {
    private videos: (VideoData | null)[] = [];
    private videoGrid!: HTMLElement;
    private globalElements!: GlobalElements;

    constructor() {
        this.videos = [null];
        this.initializeElements();
        this.initializeEventListeners();
    }

    private initializeElements(): void {
        this.videoGrid = document.getElementById('videoGrid') as HTMLElement;
        
        this.globalElements = {
            playAllBtn: document.getElementById('playAllBtn') as HTMLButtonElement,
            pauseAllBtn: document.getElementById('pauseAllBtn') as HTMLButtonElement,
            syncBtn: document.getElementById('syncBtn') as HTMLButtonElement,
            fullscreenBtn: document.getElementById('fullscreenBtn') as HTMLButtonElement,
            clearAllBtn: document.getElementById('clearAllBtn') as HTMLButtonElement,
            infoPanel: document.getElementById('infoPanel') as HTMLDivElement,
            infoGrid: document.getElementById('infoGrid') as HTMLDivElement
        };

        this.initializeVideoSection(0);
    }

    private initializeEventListeners(): void {
        this.globalElements.playAllBtn.addEventListener('click', () => this.playAllVideos());
        this.globalElements.pauseAllBtn.addEventListener('click', () => this.pauseAllVideos());
        this.globalElements.syncBtn.addEventListener('click', () => this.syncAllVideos());
        this.globalElements.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
        this.globalElements.clearAllBtn.addEventListener('click', () => this.clearAllVideos());
    }

    private initializeVideoSection(index: number): void {
        const fileInput = document.querySelector(`input[data-index="${index}"]`) as HTMLInputElement;
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileChange(e, index));
        }
    }

    private handleFileChange(event: Event, index: number): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            this.loadVideoFile(file, index);
        }
    }

    private loadVideoFile(file: File, index: number): void {
        if (this.videos[index]) {
            URL.revokeObjectURL(this.videos[index]!.url);
        }

        const url = URL.createObjectURL(file);
        const videoElement = document.querySelector(`video[data-index="${index}"]`) as HTMLVideoElement;
        const uploadLabel = document.querySelector(`label[for="video${index}"]`) as HTMLElement;
        
        videoElement.src = url;
        
        this.videos[index] = {
            file,
            element: videoElement,
            url
        };

        if (uploadLabel) {
            uploadLabel.style.display = 'none';
        }

        this.addNewVideoSection();

        videoElement.addEventListener('loadedmetadata', () => {
            this.updateVideoInfo();
            this.updateGlobalControls();
        });

        this.updateVideoInfo();
        this.updateGlobalControls();
    }

    private addNewVideoSection(): void {
        const nextIndex = this.videos.length;
        const videoSection = document.createElement('div');
        videoSection.className = 'video-section';
        videoSection.setAttribute('data-position', nextIndex.toString());
        
        videoSection.innerHTML = `
            <div class="position-label">Position ${nextIndex + 1}</div>
            <video class="video-player" data-index="${nextIndex}"></video>
            <label for="video${nextIndex}" class="upload-label">📹 <b>Click to upload dashcam video</b></label>
            <input id="video${nextIndex}" type="file" class="upload-input" accept="video/*" data-index="${nextIndex}">
        `;
        
        this.videoGrid.appendChild(videoSection);
        this.initializeVideoSection(nextIndex);
        
        this.videos.push(null);
    }



    private playAllVideos(): void {
        this.videos.forEach(video => {
            if (video) {
                video.element.play();
            }
        });
    }

    private pauseAllVideos(): void {
        this.videos.forEach(video => {
            if (video) {
                video.element.pause();
            }
        });
    }

    private syncAllVideos(): void {
        const loadedVideos = this.videos.filter(video => video !== null) as VideoData[];
        if (loadedVideos.length === 0) return;

        this.pauseAllVideos();

        loadedVideos.forEach(video => {
            video.element.currentTime = 0;
        });

        setTimeout(() => {
            this.playAllVideos();
        }, 100);
    }

    private enterFullscreen(): void {
        const container = document.querySelector('.panoramic-container') as HTMLElement;
        
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
            (container as any).msRequestFullscreen();
        }
    }

    private clearAllVideos(): void {
        this.videos.forEach((video) => {
            if (video) {
                URL.revokeObjectURL(video.url);
            }
        });
        
        this.videoGrid.innerHTML = `
            <div class="video-section" data-position="0">
                <div class="position-label">Position 1</div>
                <video class="video-player" data-index="0"></video>
                <label for="video0" class="upload-label">📹 <b>Click to upload dashcam video</b></label>
                <input id="video0" type="file" class="upload-input" accept="video/*" data-index="0">
            </div>
        `;
        
        this.videos = [null];
        this.initializeVideoSection(0);
        this.updateVideoInfo();
        this.updateGlobalControls();
    }

    private updateGlobalControls(): void {
        const hasVideos = this.videos.some(video => video !== null);
        
        this.globalElements.playAllBtn.disabled = !hasVideos;
        this.globalElements.pauseAllBtn.disabled = !hasVideos;
        this.globalElements.syncBtn.disabled = !hasVideos;
        this.globalElements.fullscreenBtn.disabled = !hasVideos;
        this.globalElements.clearAllBtn.disabled = !hasVideos;
    }

    private updateVideoInfo(): void {
        const loadedVideos = this.videos.filter(video => video !== null) as VideoData[];
        
        if (loadedVideos.length === 0) {
            this.globalElements.infoPanel.style.display = 'none';
            return;
        }

        this.globalElements.infoPanel.style.display = 'block';
        this.globalElements.infoGrid.innerHTML = '';

        this.videos.forEach((video, index) => {
            if (video) {
                const infoCard = this.createVideoInfoCard(video, index + 1);
                this.globalElements.infoGrid.appendChild(infoCard);
            }
        });
    }

    private createVideoInfoCard(video: VideoData, position: number): HTMLElement {
        const card = document.createElement('div');
        card.className = 'video-info';
        
        card.innerHTML = `
            <h4>Position ${position}</h4>
            <div class="info-item">
                <span class="info-label">File Name:</span>
                <span class="info-value">${video.file.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">File Size:</span>
                <span class="info-value">${this.formatFileSize(video.file.size)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Duration:</span>
                <span class="info-value">${this.formatDuration(video.element.duration || 0)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Resolution:</span>
                <span class="info-value">${video.element.videoWidth || 0} × ${video.element.videoHeight || 0}</span>
            </div>
        `;
        
        return card;
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private formatDuration(seconds: number): string {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PanoramicDashcamViewer();
});
