import React from 'react';
import { Drawer, Input, Row, Col, Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';
import { Item, PlainItem } from './Item';

const { TextArea } = Input
const modeMap = {
  1: 'Create Point',
  2: 'Update Point',
};

export default class PointEditor extends React.Component {
  constructor(props) {
    super(props);
    const { title, content } = this.props;
    this.state = {
      title: title || '',
      content: content || '',
    }
  }
  onOK = () => {
    this.props.onOK(true);
  }
  onCancel = () => {
    this.props.onCancel();
  }
  onTitleChanged = (e) => {
    this.dispatchTitle(e.target.value);
  }
  dispatchTitle = debounce((title) => {
    this.setState({title});
    this.props.onTitleChanged(title);
  }, 300)
  onContentChanged = (e) => {
    this.dispatchContent(e.target.value);
  }
  dispatchContent = debounce((content) => {
    this.setState({content});
    this.props.onContentChanged(content);
  })
  render() {
    const { visible, mode, repoName, relations } = this.props;
    const { title, content } = this.state;
    const noBorder = { content: { border: 'none' }};
    return (
      <Drawer
        closable={false}
        destroyOnClose={false}
        maskColosable={false}
        visible={visible}
        width={500}
        title="Point Editor"
        className="editor-node"
      >
        <Item title="Title" style={noBorder}>
          <Input
            placehodler="Title"
            onChange={this.onTitleChanged}
            size="large"
            rows={1}
          />
        </Item>
        <Item title="Title Preview">
          <ReactMarkdown source={title}/>
        </Item>
        <Item title="Content" style={noBorder}>
          <TextArea 
            placeholder="Content: markdown format" 
            onChange={this.onContentChanged}
            rows={10}
          />
        </Item>
        <Item title="Content Preview" >
          <ReactMarkdown source={content}/>
        </Item>
        <PlainItem title="Node Relations" value={JSON.stringify(relations)} />
        <PlainItem title="Repository" value={repoName} />
        <Row>
          <Col span={8}  offset={8} className="col-main-button">
            <Button onClick={this.onCancel} type="ghost" size="large">Cancel</Button>
          </Col>
          <Col span={8} className="col-main-button">
            <Button onClick={this.onOK} type="primary" size="large">{modeMap[mode]}</Button>
          </Col>
        </Row>
      </Drawer>
    )

  }
}