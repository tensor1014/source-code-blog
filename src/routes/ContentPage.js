import React from 'react';
import { connect } from 'dva';
import Code from '../components/Code';
import { Layout } from 'antd';
import FileTree from '../components/FileTree';
import NodeEditor from '../components/Editor/NodeEditor';
import { createAction } from '../models/helper';
import './ContentPage.less';

const { Header, Content, Sider } = Layout;

class ContentPage extends React.Component {
  componentDidMount() {
    const { repository } = this.props;
    if (repository.currentRepo === undefined) {
      this.props.getRepositoryDetail(3);
    }
  }
  render() {
    const { file, node, point, repository } = this.props;
    const { path: filePath } = file;
    const { onPointTitleChanged, onPointContentChanged, onPointEditorOK, onPointEditorCancel } = this.props;
    const pointProps = {
      ...point, 
      onTitleChanged: onPointTitleChanged, 
      onContentChanged: onPointContentChanged, 
      onOK: onPointEditorOK, 
      onCancel: onPointEditorCancel,
    };
    const points = repository.points;
    return (
      <Layout className="content-page"> 
        <Header className="content-page-header">
          header
        </Header>
        <Layout style={{height: 700}}>
          <Sider width={300} style={{overflow: 'auto'}}>
            <FileTree tree={file.tree} onFileChanged={this.props.onFileChanged}/>
          </Sider>
          <Content style={{height: 700}}>
            <Code 
              code={file.code}
              onAddNode={this.props.onAddNode}
            />
            <NodeEditor 
              {...node}
              point={pointProps}
              points={points}
              path={filePath}
              onOK={this.props.onEditorOK}
              onCancel={this.props.onEditorCancel}
              onTitleChanged={this.props.onNodeTitleChanged}
              onContentChanged={this.props.onNodeContentChanged}
              searchPointByTitle={this.props.searchPointByTitle}
              openPointEditor={this.props.openPointEditor}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
} 
function mapStateToProps ({ repository, file, node, point }) {
  return { repository, file, node, point };
};

function mapDispatchToProps (dispatch) {
  return {
    onFileChanged(path) {
      dispatch({ type: 'file/getFile', payload: path });
    },
    getRepositoryDetail(repoId) {
      dispatch(createAction('repository/getReposotoryDetail', 3));
    },
    onNodeTitleChanged(title) {
      dispatch(createAction('node/setTitle', title));
    },
    onNodeContentChanged(content) {
      dispatch(createAction('node/setContent', content));
    },
    onEditorOK(isValid) {
      if (isValid) {
        dispatch(createAction('node/createNode', {}));
      }
    },
    onEditorCancel() {
      dispatch(createAction('node/setVisible', false));
    },
    onAddNode({ code, from, to }) {
      dispatch(createAction('node/setCode', code));
      dispatch(createAction('node/setRange', [[from.line, from.ch], [to.line, to.ch]] ));
      dispatch(createAction('node/setVisible', true));
    },
    onPointIdSelected(id) {
      dispatch(createAction('point/setCurrentPointWithEffect', id));
    },
    openPointEditor() {
      dispatch(createAction('point/setRelations', []));
      dispatch(createAction('point/setLabels', []));
      dispatch(createAction('point/setCurrentRepo', {}));
      dispatch(createAction('point/setVisible', true));
    },
    onPointTitleChanged(title) {
      dispatch(createAction('point/setTitle', title));
    }, 
    onPointContentChanged(content) {
      dispatch(createAction('point/setContent', content)) 
    }, 
    onPointEditorOK(isValid) {
      if (isValid) {
        dispatch(createAction('point/createPoint', {}));
      } 
    }, 
    onPointEditorCancel() {
      dispatch(createAction('point/setVisible', false));
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ContentPage);
