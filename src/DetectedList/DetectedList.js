import React from 'react';
import { Button, List, Typography, Avatar, Tooltip } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
const { Text } = Typography;
function DetectedList({ list, onSubmit, onClear }) {
  return (
    <>
      {list.length > 0 ? (
        <>
          <div style={{textAlign: 'right', marginBottom: 20}}>
            <Button 
              type="danger" 
              onClick={onClear}
            >clear</Button>
          </div>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={list}
            renderItem={item => (
              <List.Item
                key={item.uuid}
                actions={[
                  <Button onClick={() => onSubmit(item.url, item.headers.map((header) => {
                      return `${header.name}: ${header.value}`;
                    }).join('\r\n'))}
                  >
                      <DownloadOutlined />
                      Download
                  </Button>
                ]}
                extra={
                  <Tooltip title={item.url} placement='left'>
                    <img
                      width={272}
                      alt="logo"
                      src={item.image}
                    />
                  </Tooltip>
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${item.initiator}`} />}
                  title={
                    <Text
                      ellipsis={{ tooltip: item.initiator }}
                    >
                      {item.initiator}
                    </Text>}
                  description={
                    <Text>
                      {item.time}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </>
      ) : null}
    </>
  )
}


export default DetectedList;