interface VideoData {
    file: File;
    element: HTMLVideoElement;
    url: string;
}

interface GlobalElements {
    playAllBtn: HTMLButtonElement;
    pauseAllBtn: HTMLButtonElement;
    restartBtn: HTMLButtonElement;
    fullscreenBtn: HTMLButtonElement;
    newRowBtn: HTMLButtonElement;
    clearAllBtn: HTMLButtonElement;
    infoPanel: HTMLDivElement;
    infoGrid: HTMLDivElement;
}

class PanoramicDashcamViewer {
    private videos: (VideoData | null)[] = [];
    private videoGrids: HTMLElement[] = [];
    private globalElements!: GlobalElements;

    constructor() {
        this.videos = [null];
        this.initializeElements();
        this.initializeEventListeners();
    }

    private initializeElements(): void {
        const initialGrid = document.getElementById('videoGrid') as HTMLElement;
        this.videoGrids.push(initialGrid);
        
        this.globalElements = {
            playAllBtn: document.getElementById('playAllBtn') as HTMLButtonElement,
            pauseAllBtn: document.getElementById('pauseAllBtn') as HTMLButtonElement,
            restartBtn: document.getElementById('syncBtn') as HTMLButtonElement,
            fullscreenBtn: document.getElementById('fullscreenBtn') as HTMLButtonElement,
            newRowBtn: document.getElementById('newRowBtn') as HTMLButtonElement,
            clearAllBtn: document.getElementById('clearAllBtn') as HTMLButtonElement,
            infoPanel: document.getElementById('infoPanel') as HTMLDivElement,
            infoGrid: document.getElementById('infoGrid') as HTMLDivElement
        };

        this.initializeVideoSection(0);
    }

    private initializeEventListeners(): void {
        this.globalElements.playAllBtn.addEventListener('click', () => this.playAllVideos());
        this.globalElements.pauseAllBtn.addEventListener('click', () => this.pauseAllVideos());
        this.globalElements.restartBtn.addEventListener('click', () => this.syncAllVideos());
        this.globalElements.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
        this.globalElements.newRowBtn.addEventListener('click', () => this.addNewVideoRow());
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

        const gridIndex = this.findGridContainingVideoIndex(index);
        this.addNewVideoSection(gridIndex);

        videoElement.addEventListener('loadedmetadata', () => {
            this.updateVideoInfo();
            this.updateGlobalControls();
        });

        this.updateVideoInfo();
        this.updateGlobalControls();
    }

    private findGridContainingVideoIndex(videoIndex: number): number {
        const videoSection = document.querySelector(`input[data-index="${videoIndex}"]`)?.closest('.video-section') as HTMLElement;
        if (videoSection) {
            const gridIndex = videoSection.getAttribute('data-grid');
            if (gridIndex) {
                return parseInt(gridIndex);
            }
        }
      
        return 0;
    }

    private addNewVideoSection(gridIndex: number): void {
        const nextIndex = this.videos.length;
        const targetGrid = this.videoGrids[gridIndex];
        
        const videoSection = document.createElement('div');
        videoSection.className = 'video-section';
        videoSection.setAttribute('data-position', nextIndex.toString());
        videoSection.setAttribute('data-grid', gridIndex.toString());
        
        videoSection.innerHTML = `
            <div class="position-label">Position ${nextIndex + 1}</div>
            <video class="video-player" data-index="${nextIndex}"></video>
            <label for="video${nextIndex}" class="upload-label">📹 <b>Click to upload dashcam video</b></label>
            <input id="video${nextIndex}" type="file" class="upload-input" accept="video/*" data-index="${nextIndex}">
        `;
        
        targetGrid.appendChild(videoSection);
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
        document.querySelectorAll('.video-section').forEach((section, index) => {
            if (this.videos[index] === null) {
                (section as HTMLElement).style.display = 'none';
            }
        });

        const container = document.querySelector('.panoramic-container') as HTMLElement;
        
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
            (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
            (container as any).msRequestFullscreen();
        }

        document.addEventListener('fullscreenchange', this.onFullscreenExit.bind(this));
        document.addEventListener('webkitfullscreenchange', this.onFullscreenExit.bind(this));
    }

    private onFullscreenExit(): void {
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
            document.querySelectorAll('.video-section').forEach(section => {
                (section as HTMLElement).style.display = 'flex';
            });
        }
    }

    private addNewVideoRow(): void {
        const nextIndex = this.videos.length;
        
        const newVideoGrid = document.createElement('div');
        newVideoGrid.className = 'video-grid';
        newVideoGrid.id = `videoGrid${this.videoGrids.length}`;
        
        const videoSection = document.createElement('div');
        videoSection.className = 'video-section';
        videoSection.setAttribute('data-position', nextIndex.toString());
        videoSection.setAttribute('data-grid', this.videoGrids.length.toString());
        
        videoSection.innerHTML = `
            <div class="position-label">Position ${nextIndex + 1}</div>
            <video class="video-player" data-index="${nextIndex}"></video>
            <label for="video${nextIndex}" class="upload-label">📹 <b>Click to upload dashcam video</b></label>
            <input id="video${nextIndex}" type="file" class="upload-input" accept="video/*" data-index="${nextIndex}">
        `;
        
        newVideoGrid.appendChild(videoSection);
        
        const panoramicContainer = document.querySelector('.panoramic-container') as HTMLElement;
        panoramicContainer.appendChild(newVideoGrid);
        
        this.videoGrids.push(newVideoGrid);
        this.videos.push(null);
        this.initializeVideoSection(nextIndex);
    }

    private clearAllVideos(): void {
        this.videos.forEach((video) => {
            if (video) {
                URL.revokeObjectURL(video.url);
            }
        });
        
        const panoramicContainer = document.querySelector('.panoramic-container') as HTMLElement;
        this.videoGrids.slice(1).forEach(grid => {
            panoramicContainer.removeChild(grid);
        });
        
        this.videoGrids = [this.videoGrids[0]];
        this.videoGrids[0].innerHTML = `
            <div class="video-section" data-position="0" data-grid="0">
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
        this.globalElements.restartBtn.disabled = !hasVideos;
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
