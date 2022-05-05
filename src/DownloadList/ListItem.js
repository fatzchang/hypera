import { Tag, Button, List, Typography } from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons';
import { formatBytes } from '../utils/format';

const { Text } = Typography;


function ListItem({item, onCancel}) {
  return (
    <List.Item key={item.videoId}>
      <List.Item.Meta
        title={
          <Text
            style={{ with: 100, paddingRight: 10 }}
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
            {item.status === 'finished' && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                finished
              </Tag>
            )}

            {item.status === 'failed' && (
              <Tag icon={<CloseCircleOutlined />} color="error">
                failed
              </Tag>
            )}
          </>
        }
      />
      <Button
        onClick={onCancel.bind(null, item.videoId)}
        htmlType="button"
        type="danger"
        size='small'
      >remove</Button>
    </List.Item>
  )
}

export default ListItem;