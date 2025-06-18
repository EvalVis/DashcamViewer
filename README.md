# Dashcam Viewer

## Loaded screen

![Loaded screen](images/loaded_screen.png)

## Empty screen

![Empty screen](images/empty_screen.png)

## Functionality

1. Upload videos. User can upload horizontally to make a panorama or add new rows of videos.
2. Play/pause all videos at the same time to keep them in sync.
3. Restart all videos if they come out of sync.
4. Enter fullscreen mode.
5. Clear all videos to start uploading anew.
6. View uploaded videos' statistics.

## Running locally

```
npm install
npm run serve
```

Navigate to `http://127.0.0.1:8080/public/index.html`.

## Hosting

Simplest way to host the app is to use [<small>vercel.com</small>](https://vercel.com). It detects `vercel.json`, installs the dependencies and runs the app on the cloud.

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://dashcamviewer.programmersdiary.com/)

## License

Please read a `LICENSE` file.