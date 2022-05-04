import React from 'react';
import { Button, List, Typography, Avatar } from 'antd';
import { DownloadOutlined  } from '@ant-design/icons';
const { Text } = Typography;


function DetectedList({ list, onSubmit }) {
  return (
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
            <img
              width={272}
              alt="logo"
              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            />
          }
        >
          <List.Item.Meta
            avatar={<Avatar src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${item.initiator}`} />}
            title={
              <Text
                ellipsis={{ tooltip: item.initiator }}
              >
                From: {item.initiator}
              </Text>}
            description={
              <Text
                ellipsis={{ tooltip: item.url }}
              >
                {item.url}
              </Text>
            }
          />
          {item.content}
        </List.Item>
      )}
    />
  )
}


export default DetectedList;