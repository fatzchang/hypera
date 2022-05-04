import { Input, Button, Form, Layout, Divider, Card, Row, Col, Space } from 'antd';
import { ClearOutlined, DownloadOutlined, LoadingOutlined  } from '@ant-design/icons';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import DownloadList from '../DownloadList/DownloadList';
import DetectedList from '../DetectedList/DetectedList';

const { Sider, Content } = Layout;
const { 
  ipcSend, 
  ipcInvoke, 
  ipcOnResponse, 
  ipcRemoveHandler 
} = window.privilegeAPI;

function App() {
  const [downloadList, setDownloadList] = useState([]);
  const [detectedList, setDetectedList] = useState([]);
  
  const prevDownloadList = useRef(downloadList);
  const prevIpcKey = useRef({
    downloadedSize: null,
    downloadStatus: null,
    videoDetected: null
  });

  const submitNewVideo = (url) => {
    ipcInvoke('new video', {
      url: url,
    }).then((videoInfo) => {
      if (videoInfo) {
        const newList = [
          ...downloadList, 
          {
            url: videoInfo.url,
            filename: videoInfo.filename,
            videoId: videoInfo.id,
            status: 'downloading',
            downloadedSize: 0
          }
        ];
        console.log(newList)
        setDownloadList(newList);
      }
    });
  }

  const onFinish = (values) => {
    submitNewVideo(values.m3u8)

    // prevent memory leak
    // https://stackoverflow.com/questions/69718631/electronjs-uncaught-typeerror-ipcrenderer-on-is-not-a-function
    // https://github.com/electron/electron/issues/21437#issuecomment-802288574
  };

  const onCancel = (videoId) => {
    ipcSend('cancel download', {
      videoId: videoId
    });

    const newList = [...downloadList];
    const index = newList.findIndex((item) => item.videoId === videoId);

    if (index > -1) {
      newList.splice(index, 1); // 2nd parameter means remove one item only
    }

    setDownloadList(newList);  
  }


  useEffect(() => {
    if (prevDownloadList.current.length !== downloadList.length) {
      if (
        prevIpcKey.current['downloadedSize'] && 
        prevIpcKey.current['downloadStatus']
      ) {
        ipcRemoveHandler('downloaded size', prevIpcKey.current['downloadedSize']);
        ipcRemoveHandler('download status', prevIpcKey.current['downloadStatus']);
      }

      prevIpcKey.current['downloadedSize'] = ipcOnResponse('downloaded size', (arg) => {
        // console.log('download size triggered', arg.videoId)
        const newList = [...downloadList];
        const downloadItem = newList.find(item => {
          return item.videoId === arg.videoId;
        });

        if (downloadItem) {
          downloadItem.downloadedSize = arg.downloadedSize;
          setDownloadList(newList);  
        }
        
      });

      prevIpcKey.current['downloadStatus'] = ipcOnResponse('download status', (arg) => {
        console.log(arg);
        const newList = [...downloadList];
        const downloadItem = newList.find(item => {
          return item.videoId === arg.videoId;
        });
        
        if (downloadItem) {
          downloadItem.status = arg.statusCode === 0 ? 'finished' : 'failed';
          setDownloadList(newList);
        }
      });
    }

    prevDownloadList.current = downloadList;

  }, [downloadList]);

  // handle video detect request from hypera detector
  useEffect(() => {
    if (prevIpcKey.current['videoDetected']) {
      ipcRemoveHandler('video detected', prevIpcKey.current['videoDetected']);
    }

    prevIpcKey.current['videoDetected'] = ipcOnResponse('video detected', (arg) => {
      const newDetectedList = [...detectedList];
      newDetectedList.unshift(arg);
      setDetectedList(newDetectedList)
      console.log(newDetectedList);
    });
  }, [detectedList]);

  return (
    <div className="App">
      <Layout>
        <Layout>
          <Content>
            <div style={{
                padding: '30px', 
                backgroundColor: 'white', 
                minHeight: 741,
                height: '100vh',
                overflowY: 'auto'
              }}>
              <Form onFinish={onFinish}>
                <Form.Item
                  label="M3U8 URL"
                  name="m3u8"
                  initialValue=''
                  rules={[{ required: true, message: 'Please input m3u8 url!', }]}
                >
                  <Input
                    style={{ width: '400px' }} 
                  />
                </Form.Item>
                <Form.Item>
                  <Button 
                    htmlType="submit" 
                    type="primary"
                    >
                    <Space size={'middle'}>
                      Download Directly
                    </Space>
                  </Button>
                </Form.Item>
              </Form>
              <Divider />
              <DetectedList list={detectedList} onSubmit={submitNewVideo} />
            </div>
          </Content>
          <Sider width={392} style={{padding: '30px', overflow: 'hidden'}} theme='light'>
            <DownloadList list={downloadList} onCancel={onCancel} />
          </Sider>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
