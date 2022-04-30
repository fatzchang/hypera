import { Tag, Input, Button, Form } from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './App.css';
import { useEffect, useState } from 'react';
const { ipcSend, ipcOnResponse } = window.privilegeAPI;





function App() {
  const [downloadState, setDownloadState] = useState('finished');
  const [downloadedSize, setDownloadedSize] = useState(0);
  const onFinish = (values) => {
    ipcSend('new video', {
      url: values.m3u8,
      saveLocation: './cad'
    });

    // prevent memory leak
    // https://stackoverflow.com/questions/69718631/electronjs-uncaught-typeerror-ipcrenderer-on-is-not-a-function
    // https://github.com/electron/electron/issues/21437#issuecomment-802288574
  };

  useEffect(() => {
    ipcOnResponse('download status', (event, arg) => {
      setDownloadedSize(13);
      // console.log(arg);
    });
  }, [])

  return (
    <div className="App">
      <Form onFinish={onFinish}>
        <Form.Item
           label="M3U8 URL"
           name="m3u8"
           initialValue=''
           rules={[{ required: true, message: 'Please input m3u8 url!', }]}
        >
          <Input
            style={{ width: '500px' }} 
            placeholder='m3u8'
          />
        </Form.Item>
        <Form.Item>
          <Button 
            htmlType="submit" 
            type="primary"
            disabled={downloadState === 'downloading'}
          >Submit</Button>
        </Form.Item>
      </Form>
      {downloadState === 'downloading' && (
        <Tag icon={<SyncOutlined spin />} color="processing">
          {downloadedSize}KB
        </Tag>
      )}

      {downloadState === 'finished' && (
        <Tag icon={<CheckCircleOutlined />} color="success">
          finished
        </Tag>
      )}
      
    </div>
  );
}

export default App;
