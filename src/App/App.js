import { Input, Button, Form, Layout, Divider, Space, message } from 'antd';
import styles from './App.module.css';
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

  const submitNewVideo = (url, headers = []) => {
    ipcInvoke('new video', {
      url: url,
      headers
    }).then((videoInfo) => {
      // could be null if user cancele at location select dialog
      if (videoInfo) {
        const newList = [...downloadList]
        newList.push({
          ...videoInfo,
          status: 'downloading',
          downloadedSize: 0
        });

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

  // handle download list at right side
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

  // handle ws client connect message
  useEffect(() => {
    console.log('restrict mode will render app twice!');

    let connectKey = ipcOnResponse('ws connected', () => {
      message.success('A client has connected!');
    });

    let disconnectKey = ipcOnResponse('ws disconnected', () => {
      message.info('A client has disconnected!');
    });

    return () => {
      ipcRemoveHandler('ws connected', connectKey);
      ipcRemoveHandler('ws disconnected', disconnectKey);
    }
  }, []);

  return (
    <div className="App">
      <Layout>
        <Layout>
          <Content>
            <div className={styles.content}>
              <Form onFinish={onFinish}>
                <Form.Item
                  label="M3U8 URL"
                  name="m3u8"
                  initialValue=''
                  rules={[{ required: true, message: 'Please input m3u8 url!', }]}
                >
                  <Input className={styles.url} />
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
          <Sider width={392} className={styles.sider} theme='light'>
            <DownloadList list={downloadList} onCancel={onCancel} />
          </Sider>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
