import { Card, Row, Col, List, Typography } from 'antd';
import { ClearOutlined, DownloadOutlined  } from '@ant-design/icons';
const { Meta } = Card;
const { Text } = Typography;

function DetectedList({ list }) {
  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={list}
      renderItem={item => (
        <List.Item
          key={item.uuid}
          // actions={[
          //   <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
          //   <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
          //   <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
          // ]}
          extra={
            <img
              width={272}
              alt="logo"
              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            />
          }
        >
          <List.Item.Meta
            // avatar={<Avatar src={item.avatar} />}
            title={
              <Text
                ellipsis={{ tooltip: item.initiator }}
              >
                {item.initiator}
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
    // <div style={{width: 700}}>
    //   <Row gutter={[16, 24]}>
    //     {list.map((item) => (
    //       <Col span={12} key={item.uuid}>
    //         <Card
    //           // bodyStyle={{display: 'none'}}
    //           style={{width: 300}}
    //           cover={
    //             <img
    //               alt="example"
    //               src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    //             />
    //           }
    //           actions={[
    //             <DownloadOutlined />,
    //             <ClearOutlined />
    //           ]}
    //         >
    //           <Meta
    //             title="Card title"
    //             description={item.url}
    //           />
    //         </Card>
    //       </Col>
    //     ))}
    //   </Row>
    // </div>
  )
}


export default DetectedList;