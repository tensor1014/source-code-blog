import React from 'react';
import { connect } from 'dva';
import { Treebeard } from 'react-treebeard';
import decorators from './decorators';
import animations from './animations';

class FileTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  onToggle = (node, toggled) => {
    node.active = true;
    if(node.children){ node.toggled = toggled; }
    this.setState({});
    if (node.name !== 'root' && !node.children) {
      this.onFileChanged(node);
    }
  }
  render() {
    return (
      <Treebeard
        data={this.props.tree || []}
        decorators={decorators}
        animations={animations}
        onToggle={this.onToggle}
      />
    );
  }
  onFileChanged = (node) => {
    let path = node.name;
    while(node.parent && node.parent.name !== 'root') {
      node = node.parent;
      path = node.name + '/' + path;
    }
    console.warn(path);
    this.props.onFileChanged(path);
  }
}

function mapStateToProps(state) {
  return { tree: state.file.tree };
}
function mapDispatchToProps(dispatch) {
  return {
    onFileChanged(path) {
      dispatch({ type: 'file/getFile', payload: path });
    }
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(FileTree);

