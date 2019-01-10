import React from 'react';
import { connect } from 'dva';
import { Controlled as ReactCodeMirror2 } from 'react-codemirror2';
import { createAction } from '../models/helper';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import CodeMirror from 'codemirror';
import MarkdownIt from 'markdown-it';
import { Select } from 'antd';
// import 'codemirror/addon/fold/foldcode';
// import 'codemirror/addon/fold/foldgutter';
// import 'codemirror/addon/fold/brace-fold';
// import 'codemirror/addon/fold/indent-fold';
// import ReactCodeMirror from 'react-codemirror';
import './Code.less';
// import 'codemirror/mode/go/go';
// import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';

const md = new MarkdownIt();
const { Option } = Select;

const modes = {
  go: 'go',
  js: 'javascript',
  java: 'text/x-java',
}

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readOnly: true,
      mode: modes.java,
    };
    this.widget = undefined;
    this.node = undefined;
    this.instance = undefined;
  };
  componentDidUpdate() {
    this._updateWidgets();
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

  onEditorDidMount = (editor) => {
    this.instance = editor;
    this._updateWidgets();
  }
  render() {
    const { readOnly, mode } = this.state;
    const { code, path, cPointId, points } = this.props;
    const options = {
      lineNumbers: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      readOnly,
      mode,
    };
    const pTitle = points && points[cPointId] && points[cPointId].title || ''; 
    console.warn(cPointId);
    return (
      <div>
        <div className="coder-file-path">
          <code>{path}</code>
          <Select value={cPointId} style={{ width: 220, marginLeft: 600 }} onChange={this.props.onPointChanged}>
            {Object.values(points).map(p => (
              <Option key={p.id} value={p.id}>{p.title}</Option>
            ))}
          </Select>
        </div>
        <ReactCodeMirror2 
          value={code}
          options={options}
          onChange={this.onCodeChange}
          onBeforeChange={this.onCodeBeforeChange}
          onSelection={this.onCodeSelection}
          editorDidMount={this.onEditorDidMount}
        />
      </div>
    );
  }
  _updateWidgets() {
    if (this.instance) {
      const { node } = this.props;
      if (node && (!this.node || node.id !== this.node.id)) {
        if (this.widget) {
          this.widget.clear();
          this.widget = undefined;
        }
        if (this.node) {
          const [[oldFrom], [oldTo]] = this.node.range;
          this._unMarkSelectionLines(oldFrom, oldTo);
        }
        const { range, title, content } = node;
        const [[from], [to]] = range;
        const html = md.render(title) + md.render(content);
        this.widget = this._addWidget(this.intance, html, from);
        this._markSelectionLines(from, to);
        this._autoScroll(from, to);
        this.node = node;
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
      console.warn('mark from:', from, ' to:', to);
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
  _unMarkSelectionLines(from, to) {
    if (this.instance) {
      console.warn('un mark from:', from, ' to:', to);
      for (let i = from; i <= to; i++) {
        if (i === from) {
          this.instance.removeLineClass(i, 'background', 'reader-code-selected');
        } else if (i === to) {
          if (i !== 0) {
            this.instance.removeLineClass(i, 'background', 'reader-code-selected');
          }
        } else {
          this.instance.removeLineClass(i, 'background', 'reader-code-selected');
        }
      } 
    }
  }
  _autoScroll(fromLine, toLine) {
    if (this.instance) {
      console.warn('scroll to line from:', fromLine, ' to:', toLine);
      this.instance.scrollIntoView({
        from: CodeMirror.Pos(fromLine, 0),
        to: CodeMirror.Pos(toLine, 0),
      }, 50);
    }
  } 
}
function mapStateToProps(state) {
  const { code, path } = state.file;
  const { points, current } = state.point;
  let node = state.node.nodes[state.node.current];
  node = node && node.path === path ? node : undefined;
  return { code, node, path, points, cPointId: current };
}

function mapDispatchToProps(dispatch) {
  return {
    onAddNode({ code, from, to }) {
      const range = [[from.line, from.ch], [to.line, to.ch]];
      dispatch(createAction('node/openNodeEditor', {code, range, mode: 1}));
    },
    onPointChanged(pointId) {
      dispatch(createAction('point/setCurrent', pointId));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Code);

