import { Tag, Input, Button, Form } from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import './App.css';
import { useEffect, useState } from 'react';

const { ipcSend, ipcOnResponse } = window.privilegeAPI;

function App() {
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const onFinish = (values) => {
    setDownloadStatus('downloading');

    ipcSend('new video', {
      url: values.m3u8,
    });

    // prevent memory leak
    // https://stackoverflow.com/questions/69718631/electronjs-uncaught-typeerror-ipcrenderer-on-is-not-a-function
    // https://github.com/electron/electron/issues/21437#issuecomment-802288574
  };

  useEffect(() => {
    ipcOnResponse('downloaded size', (event, arg) => {
      setDownloadedSize(arg);
      // console.log(arg);
    });

    ipcOnResponse('download status', (event, arg) => {
      setDownloadStatus(arg === 0 ? 'finished' : 'failed')
    });
  }, []);

  const onCancel = () => {
    ipcSend('cancel download', {
      videoId: 'video1'
    });
  }

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
            disabled={downloadStatus === 'downloading'}
          >Submit</Button>
        </Form.Item>
      </Form>


      {downloadStatus === 'downloading' && (
        <>
          <Tag icon={<SyncOutlined spin />} color="processing">
            {downloadedSize}KB
          </Tag>
          <Button 
            onClick={onCancel}
            htmlType="button" 
            type="danger"
            size='small'
          >cancel</Button>
        </>
      )}

      {downloadStatus === 'finished' && (
        <Tag icon={<CheckCircleOutlined />} color="success">
          finished
        </Tag>
      )}

      {downloadStatus === 'failed' && (
        <Tag icon={<CloseCircleOutlined  />} color="error">
          failed
        </Tag>
      )}
    </div>
  );
}

export default App;
