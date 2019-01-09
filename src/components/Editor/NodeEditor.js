import React from 'react';
import { connect } from 'dva';
import { Drawer, Button, Row, Col, Input } from 'antd';
import Highlight from 'react-highlight';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';
import { PlainItem, Item } from './Item';
import PointDrawer from './PointEditor';
import 'highlight.js/styles/github-gist.css';
import './index.less';
import { openFromNode } from '../../models/point';
import { createAction } from '../../models/helper';

const { TextArea } = Input;

const modeMap = {
  1: 'Create Node',
  2: 'Update Node',
};
const noBorder = { content: { border: 'none' }};

class NodeEditor extends React.Component {
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
    this.props.onTitleChanged(title);
  }, 300)
  onContentChanged = (e) => {
    this.dispatchContent(e.target.value);
  }
  dispatchContent = debounce((content) => {
    this.props.onContentChanged(content);
  }, 300)
  onOpenPointDrawer = () => {
    this.props.openPointEditor();
  }
  render() {
    const { editing, pointTitle } = this.props;
    const { title, content, code, mode, path, range } = editing || {};
    let rangeText = '';
    if (range) {
      const [[fLine, fCh], [tLine, tCh]] = range;
      rangeText = `from line ${fLine + 1} ch ${fCh + 1} to line ${tLine + 1} ch ${tCh + 1}`; 
    }
   return (
      <Drawer
        closable={false}
        destroyOnClose={true}
        maskClosable={false}
        visible={editing !== undefined}
        width={620}
        title="Node Editor"
        className="editor-node"
      >
        <Item title="Related Point" style={noBorder}>
          <Row>
            <Col span={16}>
              <div className="plain-text with-border">{pointTitle}</div>
            </Col>
            <Col span={7} offset={1}>
              <Button size="large" onClick={this.onOpenPointDrawer}>Create New</Button>
            </Col>
          </Row>
          <PointDrawer location={openFromNode}/>
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

function mapStateToProps(state) {
  const { node, point } = state;
  const editing = node.editing;
  const currentPoint = point.points[point.current];
  const pointTitle = currentPoint ? currentPoint.title : '';
  return { editing, pointTitle };
}

function mapDispatchToProps(dispatch) {
  return {
    onTitleChanged(title) {
      dispatch(createAction('node/setEditing', { title }));
    },
    onContentChanged(content) {
      dispatch(createAction('node/setEditing', { content }));
    },
    onOK(isValid) {
      if (isValid) {
        dispatch(createAction('node/createNode', undefined));
      }
    },
    onCancel() {
      dispatch(createAction('node/finishEditing', undefined));
    },
    openPointEditor() {
      dispatch(createAction('point/openPointEditor', openFromNode));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NodeEditor);