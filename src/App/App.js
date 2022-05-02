import { Input, Button, Form, Layout } from 'antd';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import DownloadList from '../DownloadList/DownloadList';
const { Sider, Content } = Layout;
const { 
  ipcSend, 
  ipcInvoke, 
  ipcOnResponse, 
  ipcRemoveHandler 
} = window.privilegeAPI;

function App() {
  const [downloadList, setDownloadList] = useState([]);
  
  const prevDownloadList = useRef(downloadList);
  const prevIpcKey = useRef([null, null]);

  const onFinish = (values) => {
    ipcInvoke('new video', {
      url: values.m3u8,
    }).then((videoInfo) => {
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
    });

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
      if (prevIpcKey.current[0] && prevIpcKey.current[1]) {
        ipcRemoveHandler('downloaded size', prevIpcKey.current[0]);
        ipcRemoveHandler('download status', prevIpcKey.current[1]);
      }

      prevIpcKey.current[0] = ipcOnResponse('downloaded size', (arg) => {
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

      prevIpcKey.current[1] = ipcOnResponse('download status', (arg) => {
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



  return (
    <div className="App">
      <Layout style={{height: '100vh'}}>
        <Layout>
          <Content style={{padding: '30px'}}>
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
                >Submit</Button>
              </Form.Item>
            </Form>
          </Content>
          <Sider width={400} style={{padding: '30px', overflow: 'hidden'}} theme='light'>
            <DownloadList list={downloadList} onCancel={onCancel} />
          </Sider>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
