import React from 'react';
import { connect } from 'dva';
import { Controlled as ReactCodeMirror2 } from 'react-codemirror2';
import { createAction } from '../models/helper';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import CodeMirror from 'codemirror';
import MarkdownIt from 'markdown-it';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import ReactCodeMirror from 'react-codemirror';
import './Code.less';
import 'codemirror/mode/go/go';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';

const md = new MarkdownIt();

const modes = {
  go: 'go',
  js: 'javascript',
  java: 'text/x-java',
}

class Code extends React.Component {
  widgets = {};
  nodeIds = [];
  constructor(props) {
    super(props);
    this.state = {
      readOnly: true,
      mode: modes.java,
    };
    this.widgets = {};
    this.instance = undefined;
  };
  componentDidUpdate() {
    this._updateWidgets();
    this._autoScroll();
  } 
  toggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly,
    });
  };
  onCodeChange = (editor, data, value) => {
  }
  onCodeBeforeChange = (editor, data, value) => {
    this.setState({
      code: value
    });
  }
  onCodeSelection = debounce((editor, data) => {
    if (data.ranges && data.ranges.length > 0) {
      const from = data.ranges[0].from();
      const to = data.ranges[0].to();
      console.warn(`select from line ${from.line} ch ${from.ch} to line ${to.line} ch ${to.ch}`);
      if (from.line === to.line && from.ch === to.ch) {
        return
      }
      this._markSelectionLines(from.line, to.line);
      let code = '';
      for (let i = from.line; i <= to.line; i++) {
        code += editor.getLineTokens(i).reduce((aac, token) => aac + token.string, '') + '\n';
      }
      this.props.onAddNode({ code, from, to });
    }
  }, 300)

  onCodeScroll = debounce((editor, data) => {
    //  暂时无此需求
    /* const rect = this.instance.getWrapperElement().getBoundingClientRect();
    const topVisibleLine = editor.lineAtHeight(rect.top, "window");
    const bottomVisibleLine = editor.lineAtHeight(rect.bottom, "window");
    console.warn('top visible line:', topVisibleLine, 'bottom visible line', bottomVisibleLine); */
  }, 300)
  onEditorDidMount = (editor) => {
    this.instance = editor;
    this._updateWidgets();
  }
  render() {
    const { readOnly, mode } = this.state;
    const { code, path } = this.props;
    const options = {
      lineNumbers: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      readOnly,
      mode,
    };
    return (
      <div>
        <div className="coder-file-path">{path}</div>
        <ReactCodeMirror2 
          value={code}
          options={options}
          onChange={this.onCodeChange}
          onBeforeChange={this.onCodeBeforeChange}
          onSelection={this.onCodeSelection}
          onScroll={this.onCodeScroll}
          editorDidMount={this.onEditorDidMount}
        />
      </div>
    );
  }
  _updateWidgets() {
    if (this.instance) {
      const { nodes } = this.props;
      const nodeIds2 = Object.keys(this.props.nodes);
      const nodeIds = Object.keys(this.widgets);
      for (let id of difference(nodeIds2, nodeIds)) {
        const node = nodes[id];
        if (node) {
          const { range, title, content } = node;
          const [[from], [to]] = range;
          const html = md.render(title) + md.render(content);
          this.widgets[id] = this._addWidget(this.intance, html, from);
          this._markSelectionLines(from, to);
        }
      }
      for (let id of difference(nodeIds, nodeIds2)) {
        this.widgets[id].clear();
        delete this.widgets[id];
      }
    }
  }
  _addWidget(editor, html, line) {
    const msg = document.createElement('span');
    msg.innerHTML = html;
    msg.className="reader-code-widget-point-tag";
    const widget = this.instance.addLineWidget(line, msg, { coverGutter: false, noHScroll: true, above: true}); 
    return widget;
  }
  _foldCode(editor, pos) {
    if (this.instance) {
      this.instance.foldCode(pos);
    }
  }
  _markSelectionLines(from, to) {
    if (this.instance) {
      for (let i = from; i <= to; i++) {
        if (i === from) {
          this.instance.addLineClass(i, 'background', 'reader-code-selected');
        } else if (i === to) {
          if (i !== 0) {
            this.instance.addLineClass(i, 'background', 'reader-code-selected');
          }
        } else {
          this.instance.addLineClass(i, 'background', 'reader-code-selected');
        }
      } 
    }
  }
  _autoScroll() {
    if (this.props.autoScroll && this.instance) {
      console.warn('scroll to line: ', this.props.line);
      this.instance.scrollIntoView(CodeMirror.Pos(this.props.line, 0));
      this.props.onAutoScrollDone();
    }
  } 
}
function mapStateToProps(state) {
  const { node, point, file } = state;
  const { code, path } = file;
  const nodes = Object.values(point.points)
    .reduce((obj, p) => {
      for (let id of p.relations) {
        const n = node.nodes[id];
        if (n && n.path === path) {
          obj[n.id] = n;
        }
      }
      return obj;
    }, {});
    let line = 0;
    let autoScroll = file.autoScroll;
    if (node.nodes && node.current && file.autoScroll) {
      [[line]]= node.nodes[node.current].range;
    }
  return { code, path, nodes, line, autoScroll };
}

function mapDispatchToProps(dispatch) {
  return {
    onAddNode({ code, from, to }) {
      const range = [[from.line, from.ch], [to.line, to.ch]];
      dispatch(createAction('node/openNodeEditor', {code, range, mode: 1}));
    },
    onAutoScrollDone() {
      dispatch(createAction('file/scrollDone', undefined));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Code);

