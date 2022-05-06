# Hypera

## Description
Hypera is a m3u8 stream video downloader, based on ffmpeg.  
  
You can use Hypera with [Hypera Detector](https://www.google.com) chrome extension to capture the stream videos that is downloadable in currently opened web page.

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

### Todo
- Create a queue for each connection, prevent creating too many download rocesses