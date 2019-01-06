import React from 'react';
import { Drawer, Button, Row, Col, Input } from 'antd';
import Highlight from 'react-highlight';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';
import { PlainItem, Item } from './Item';
import PointDrawer from './PointEditor';
import 'highlight.js/styles/github-gist.css';
import './index.less';

const { TextArea } = Input;

const modeMap = {
  1: 'Create Node',
  2: 'Update Node',
};

export default class NodeEditor extends React.Component {
  constructor(props) {
    super(props);
    const { title, content } = this.props;
    this.state = {
      title: title || '',
      content: content || '',
    }
  }
  onOK = () => {
    console.warn('on ok');
    this.props.onOK(true);
  }
  onCancel = () => {
    console.warn('on cancel');
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
  }, 300)
  searchPointByTitle = debounce(title => {
    this.props.searchPointByTitle(title);
  }, 300)
  onOpenPointDrawer = () => {
    this.props.openPointEditor();
  }
  onPointSelected = (id) => {
    this.props.onPointSelected(id);
  }
  render() {
    const { visible, code, mode, path, range, point } = this.props;
    const { title, content } = this.state;
    const rangeText = range ? `from line ${range[0][0] + 1} ch ${range[0][1] + 1} to line ${range[1][0] + 1} ch ${range[1][1] + 1}` : ''; 
    const noBorder = { content: { border: 'none' }};
    return (
      <Drawer
        closable={false}
        destroyOnClose={false}
        maskClosable={false}
        visible={visible}
        width={620}
        title="Node Editor"
        className="editor-node"
      >
        <Item title="Related Point" style={noBorder}>
          <Row>
            <Col span={16}>
              <div className="plain-text with-border">{point.currentPoint && point.currentPoint.title || ''}</div>
            </Col>
            <Col span={7} offset={1}>
              <Button size="large" onClick={this.onOpenPointDrawer}>Create New</Button>
            </Col>
          </Row>
          <PointDrawer {...point}/>
        </Item>
        <PlainItem title="File Path" value={path} />
        <PlainItem title="Selected Range" value={rangeText} />
        <Item title="Selected Code" >
          <div className="code-wrapper">
            <Highlight style={noBorder}>{code}</Highlight>
          </div>
        </Item>
        <Item title="Title" style={noBorder}>
          <Input
            placeholder="Title" 
            onChange={this.onTitleChanged}
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
        <Row>
          <Col span={8}  offset={8} className="col-main-button">
            <Button onClick={this.onCancel} type="ghost" size="large">Cancel</Button>
          </Col>
          <Col span={8} className="col-main-button">
            <Button onClick={this.onOK} type="primary" size="large">{modeMap[mode]}</Button>
          </Col>
        </Row>
      </Drawer>
    );
  }
}