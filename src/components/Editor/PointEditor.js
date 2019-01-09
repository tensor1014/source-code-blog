import React from 'react';
import { Drawer, Input, Row, Col, Button } from 'antd';
import { connect } from 'dva';
import ReactMarkdown from 'react-markdown';
import debounce from 'lodash/debounce';
import { Item, PlainItem } from './Item';
import { createAction } from '../../models/helper';

const { TextArea } = Input
const modeMap = {
  1: 'Create Point',
  2: 'Update Point',
};
const noBorder = { content: { border: 'none' }};

class PointEditor extends React.Component {
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
    this.props.onTitleChanged(title);
  }, 300)
  onContentChanged = (e) => {
    this.dispatchContent(e.target.value);
  }
  dispatchContent = debounce((content) => {
    this.props.onContentChanged(content);
  })
  render() {
    const { editing, location } = this.props;
    const { title, content, mode, relations, openFrom, repoName } = editing || {};
    return (
      <Drawer
        closable={false}
        destroyOnClose={true}
        maskColosable={false}
        visible={location === openFrom && editing !== undefined}
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

function mapStateToProps(state) {
  const { editing } = state.point;
  return { editing };
}

function mapDispatchToProps(dispatch) {
  return {
    onOK(isValid) {
      dispatch(createAction('point/createPoint',  undefined));
    },
    onCancel() {
      dispatch(createAction('point/finishEditing', undefined)); 
    },
    onTitleChanged(title) {
      dispatch(createAction('point/setEditing', { title }));
    },
    onContentChanged(content) {
      dispatch(createAction('point/setEditing', { content }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PointEditor);

