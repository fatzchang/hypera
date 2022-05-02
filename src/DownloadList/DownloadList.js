import { Tag, Button, List, Typography } from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import { formatBytes } from '../utils/format';

const { Text } = Typography;

function DownloadList({ list, onCancel }) {
  return (
    <List 
    size='small'
      bordered
      dataSource={list}
      renderItem={item => (
        <List.Item key={item.videoId}>
            <List.Item.Meta
              title={
                <Text 
                  style={{ with: 100 }} 
                  ellipsis={{ tooltip: item.filename.replace(/^.*[\\\/]/, '') }}
                >
                  {item.filename.replace(/^.*[\\\/]/, '')}
                </Text>
              }
              description={
                <>
                  {item.status === 'downloading' && (
                    <Tag icon={<SyncOutlined spin />} color="processing">
                      {formatBytes(item.downloadedSize * 1024)}
                    </Tag>
                  )}
                </>
              }
            />
            <div>              
              {item.status === 'finished' && (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  finished
                </Tag>
              )}

              {item.status === 'failed' && (
                <Tag icon={<CloseCircleOutlined  />} color="error">
                  failed
                </Tag>
              )}
              
              <Button 
                onClick={onCancel.bind(null, item.videoId)}
                htmlType="button" 
                type="danger"
                size='small'
              >remove</Button>
            
            </div>
        </List.Item>
      )}
    />
  )
}


export default DownloadList;