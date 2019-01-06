import React from 'react';
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

export default FileTree;

