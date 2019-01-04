import React from 'react';
import { connect } from 'dva';
import Code from '../components/Code';
import { Layout } from 'antd';
import FileTree from '../components/FileTree';
import './ContentPage.less';

const { Header, Content, Sider } = Layout;

class ContentPage extends React.Component {
  componentDidMount() {
    const { dispatch, repository } = this.props;
    if (repository.tree === undefined) {
      dispatch({ 
        type: 'repository/getReposotoryDetail',
        payload: 3,
       });
    }
  }
  render() {
    return (
      <Layout className="content-page"> 
        <Header className="content-page-header">
          header
        </Header>
        <Layout style={{height: 700}}>
          <Sider width={300}>
            <FileTree tree={this.props.file.tree}/>
          </Sider>
          <Content>
            <Code code={this.props.file.code}/>
          </Content>
        </Layout>
      </Layout>
    );
  }
} 
export default connect(({ repository, file }) => ({
  repository,
  file,
}))(ContentPage);
