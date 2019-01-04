import React from 'react';
// import { Treebeard, decorators } from 'react-treebeard';
import { Treebeard } from 'react-treebeard';

const data = {
    name: 'root',
    toggled: true,
    children: [
        {
            name: 'parent',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        },
        {
            name: 'loading parent',
            loading: true,
            children: []
        },
        {
            name: 'parent',
            children: [
                {
                    name: 'nested parent',
                    children: [
                        { name: 'nested child 1' },
                        { name: 'nested child 2' }
                    ]
                }
            ]
        }
    ]
};

class FileTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data };
  }
  onToggle = (node, toggled) => {
    const { cursor } = this.state;
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    this.setState({ cursor: node });
 
  }
/*   onFilterMouseUp = (e) => { */
    // const filter = e.target.value.trim();
    // if (!filter) {
    //   return this.setState({data});
    // }
    // let filtered = filters.filterTree(data, filter);
    // filtered = fitlers.expandFilteredNodes(filtered, filter);
    // this.setState({ data: filtered });
/*   } */
  render() {
    return (
      <Treebeard
        data={this.props.tree || []}
        decorator
        onToggle={this.onToggle}
      />
    );
  }
}

export default FileTree;

