Hypera
===
## Description
Hypera is a m3u8 stream video downloader, based on ffmpeg.  
  
It can cooperate with Hypera Detector chrome extension to fetch the downloadable stream videos in web page.

## How to 
### Build app
```bash
# install dependencies
npm install

# build renderer UI
npm run build

# generate app
npm run electron:pack
```

### Develop
```bash
# serve renderer content
npm start

# execute electron with development env variable
npm run electron:dev
```