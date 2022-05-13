# Hypera

## Description
Hypera is a video downloader based on ffmpeg. Recently supports m3u8 stream video download, other video formats rather than stream video are under development.  

For better experiance, you can use Hypera with [Hypera Detector](https://github.com/fatzchang/hypera-detector) chrome extension to capture downloadable videos in currently opened web page.

## Build app from source code
### Prerequisites
- `Nodejs v16.13.0` or later version and `npm` installed
- ffmpeg executable file, can be downloaded [here](https://ffmpeg.org/)

### Steps
Put ffmpeg.exe into `assets` under root directory
```bash
# install dependencies
npm install

# build renderer UI
npm run build

# generate app
npm run electron:pack
```

### Todo
- Dynamic port binding
- Create a queue for each connection, prevent creating too many download rocesses