import React from 'react';
import { connect } from 'dva';
import { Steps } from 'antd';
import { createAction } from '../models/helper';
import ReactMarkdown from 'react-markdown';

import './PointNode.less';

const { Step } = Steps;
const PointNodes = (props) => {
  return (
    <Steps 
      className="point-node-steps" 
      progressDot 
      current={props.current}
    >
      {props.nodes.map(node => (
        <Step 
          key={node.id}
          title={<ReactMarkdown source={node.title}/>} 
          onClick={() => props.onSelectNode(node.id)}
        />
      ))} 
    </Steps>
  );
}

function mapStateToProps(state) {
  let nodes = [];;
  let current = 0;
  const pointId = state.point.current;
  const points = state.point.points;
  if (points && points[pointId] && points[pointId].relations && state.node.nodes) {
    const relations = points[pointId].relations;
    for (let i in relations) {
      const id = relations[i];
      if (state.node.nodes[id]) {
        nodes.push(state.node.nodes[id]);
        if (id === state.node.current) {
          current = +i;
        }
      }
    }
  }
  return { nodes, current };
}

function mapDispatchToProps(dispatch) {
  return {
    onSelectNode: (nodeId) => {
      dispatch(createAction('file/scrollToNode', nodeId));
    } 
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PointNodes);
