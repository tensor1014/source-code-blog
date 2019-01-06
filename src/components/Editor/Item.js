import { Row, Col } from 'antd';
// export default ({ row, title, value, text }) => {
//   row = Object.assign({}, styles.row, row);
//   title = Object.assign({}, styles.title, title);
//   value = Object.assign({}, styles.value, value);
//   return (
//     <Row className="display-item-row" {...row}>
//       <Col className="display-item-title" {...title}>
//         {text.title}:
//       </Col>
//       <Col className="display-item-value" {...value}>
//         {text.value}
//       </Col>
//     </Row>
//   );
// }


export const Item = ({ row, title, children, style }) => (
  <Row className="node-editor-item" {...row}>
    <Col className="item-title" span={24}>
      {title}
    </Col>
    <Col className="item-content" span={24} style={{...(style && style.content || {})}}>
      {children}
    </Col>
  </Row>
);

export const PlainItem = ({ row, title, value }) => (
  <Item title={title}>
    <span className="plain-text">{value}</span>
  </Item>
);
