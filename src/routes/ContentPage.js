import React from 'react';
import { connect } from 'dva'; 
import Code from '../components/Code';
import { Layout } from 'antd';
import FileTree from '../components/FileTree';
import NodeEditor from '../components/Editor/NodeEditor';
import PointNodes from '../components/PointNodes';
import { openFromContent } from '../models/point';
import PointEditor from '../components/Editor/PointEditor';
import { createAction } from '../models/helper';
import './ContentPage.less';

const { Header, Content, Sider } = Layout;

class ContentPage extends React.Component {
  componentDidMount() {
    if (this.props.isEmpty) {
      this.props.initWithRepo(4);
    }
  }
  render() {
    return (
      <Layout className="content-page"> 
        <Header className="content-page-header">
          header
        </Header>
        <Layout style={{height: 700}}>
          <Sider width={300} style={{overflow: 'auto'}}>
            <FileTree />
          </Sider>
          <Content style={{height: 700}}>
            <Code />
            <NodeEditor/> 
            <PointEditor location={openFromContent} />
            <PointNodes/>
          </Content>
        </Layout>
      </Layout>
    );
  }
} 

function mapStateToProps(state) {
  return { isEmpty: state.repository.current === undefined };
}
function mapDispatchToProps(dispatch) {
  return {
    initWithRepo(id) {
      console.info('init with repository id:', id);
      dispatch(createAction('repository/getRepositoryDetail', id));
    }
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ContentPage);
