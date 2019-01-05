import React from 'react';
import { Treebeard as Tree } from 'react-treebeard';
import decorators from './decorators';
import animations from './animations';

class FileTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  onToggle = (node, toggled) => {
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    this.setState({ cursor: node });
  }
  render() {
    return (
      <Tree
        data={this.props.tree || []}
        decorators={decorators}
        animations={animations}
        onToggle={this.onToggle}
      />
    );
  }
}

export default FileTree;

