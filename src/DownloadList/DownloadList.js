import { List } from 'antd';
import ListItem from './ListItem';

function DownloadList({ list, onCancel }) {
  return (
    <List 
      size='small'
      bordered
      dataSource={list}
      renderItem={item => <ListItem item={item} onCancel={onCancel} />}
    />
  )
}


export default DownloadList;