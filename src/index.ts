// Dashcam Viewer - TypeScript Entry Point

interface VideoElements {
    videoFile: HTMLInputElement;
    videoPlayer: HTMLVideoElement;
    playBtn: HTMLButtonElement;
    pauseBtn: HTMLButtonElement;
    fullscreenBtn: HTMLButtonElement;
    infoPanel: HTMLDivElement;
    fileName: HTMLSpanElement;
    fileSize: HTMLSpanElement;
    duration: HTMLSpanElement;
    resolution: HTMLSpanElement;
}

class DashcamViewer {
    private elements: VideoElements;

    constructor() {
        this.elements = this.getElements();
        this.initializeEventListeners();
    }

    private getElements(): VideoElements {
        return {
            videoFile: document.getElementById('videoFile') as HTMLInputElement,
            videoPlayer: document.getElementById('videoPlayer') as HTMLVideoElement,
            playBtn: document.getElementById('playBtn') as HTMLButtonElement,
            pauseBtn: document.getElementById('pauseBtn') as HTMLButtonElement,
            fullscreenBtn: document.getElementById('fullscreenBtn') as HTMLButtonElement,
            infoPanel: document.getElementById('infoPanel') as HTMLDivElement,
            fileName: document.getElementById('fileName') as HTMLSpanElement,
            fileSize: document.getElementById('fileSize') as HTMLSpanElement,
            duration: document.getElementById('duration') as HTMLSpanElement,
            resolution: document.getElementById('resolution') as HTMLSpanElement
        };
    }

    private initializeEventListeners(): void {
        // File input change handler
        this.elements.videoFile.addEventListener('change', (e) => this.handleFileChange(e));
        
        // Video control handlers
        this.elements.playBtn.addEventListener('click', () => this.playVideo());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseVideo());
        this.elements.fullscreenBtn.addEventListener('click', () => this.enterFullscreen());
    }

    private handleFileChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
            this.loadVideoFile(file);
        }
    }

    private loadVideoFile(file: File): void {
        const url = URL.createObjectURL(file);
        this.elements.videoPlayer.src = url;
        
        // Enable controls
        this.enableControls();
        
        // Show and populate info panel
        this.showVideoInfo(file);
        
        // Set up metadata handler
        this.elements.videoPlayer.addEventListener('loadedmetadata', () => {
            this.updateVideoMetadata();
        });
    }

    private enableControls(): void {
        this.elements.playBtn.disabled = false;
        this.elements.pauseBtn.disabled = false;
        this.elements.fullscreenBtn.disabled = false;
    }

    private showVideoInfo(file: File): void {
        this.elements.infoPanel.style.display = 'block';
        this.elements.fileName.textContent = file.name;
        this.elements.fileSize.textContent = this.formatFileSize(file.size);
    }

    private updateVideoMetadata(): void {
        const video = this.elements.videoPlayer;
        this.elements.duration.textContent = this.formatDuration(video.duration);
        this.elements.resolution.textContent = `${video.videoWidth} × ${video.videoHeight}`;
    }

    private playVideo(): void {
        this.elements.videoPlayer.play();
    }

    private pauseVideo(): void {
        this.elements.videoPlayer.pause();
    }

    private enterFullscreen(): void {
        const video = this.elements.videoPlayer;
        
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
            (video as any).webkitRequestFullscreen();
        } else if ((video as any).msRequestFullscreen) {
            (video as any).msRequestFullscreen();
        }
    }

    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private formatDuration(seconds: number): string {
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

// Initialize the dashcam viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashcamViewer();
    console.log('Dashcam Viewer initialized successfully!');
});
