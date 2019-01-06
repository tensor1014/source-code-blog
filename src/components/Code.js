import React from 'react';
import { Controlled as ReactCodeMirror2 } from 'react-codemirror2';
import debounce from 'lodash.debounce';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import ReactCodeMirror from 'react-codemirror';
import './Code.less';
import 'codemirror/mode/go/go';
import 'codemirror/mode/javascript/javascript';


const modes = {
  go: 'go',
  javascript: 'javascript',
}

class Code extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      readOnly: true,
      mode: modes.go
    };
  };
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
  onCodeSelection = (editor, data) => {
    if (data.ranges && data.ranges.length > 0) {
      const from = data.ranges[0].from();
      const to = data.ranges[0].to();
      console.warn(`select from line ${from.line} ch ${from.ch} to line ${to.line} ch ${to.ch}`);
      if (from.line === to.line && from.ch === to.ch) {
        return
      }
      this.addWidget(editor, from, to);
      let code = '';
      for (let i = from.line; i <= to.line; i++) {
        code += editor.getLineTokens(i).reduce((aac, token) => aac + token.string, '') + '\n';
        if (i === from.line) {
          editor.addLineClass(i, 'background', 'reader-code-selected');
        } else if (i === to.line) {
          if (i !== 0) {
            editor.addLineClass(i, 'background', 'reader-code-selected');
          }
        } else {
          editor.addLineClass(i, 'background', 'reader-code-selected');
        }
      }
      this.props.onAddNode({ code, from, to });
      // console.warn(text);
      // editor.foldCode(CodeMirror.Pos(from.line, from.ch));
    }
  }
  foldCode(editor, pos) {
    editor.foldCode(pos);
  }
  addWidget(editor, from, to) {
    const msg = document.createElement('span');
    let text = document.createTextNode(`line:${from.line} ch:${from.ch} - line:${to.line} ch:${to.ch}`);
    text.onclick="this.contentEditable='true';";
    msg.appendChild(text);
    msg.className="reader-code-widget-point-tag";
    const widget = editor.addLineWidget(from.line, msg, { coverGutter: false, noHScroll: true, above: true}); 
    setTimeout(() => widget.clear(), 2000);
  }
  onCodeScroll = (editor, data) => {
    const rect = editor.getWrapperElement().getBoundingClientRect();
    const topVisibleLine = editor.lineAtHeight(rect.top, "window");
    const bottomVisibleLine = editor.lineAtHeight(rect.bottom, "window");
    console.warn('top visible line:', topVisibleLine, 'bottom visible line', bottomVisibleLine);
  }
  render() {
    const { readOnly, mode } = this.state;
    const options = {
      lineNumbers: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      readOnly,
      mode,
    };
    return (
      <div>
        <ReactCodeMirror2 
          value={this.props.code}
          options={options}
          onChange={this.onCodeChange}
          onBeforeChange={this.onCodeBeforeChange}
          onSelection={debounce(this.onCodeSelection, 400)}
          onScroll={debounce(this.onCodeScroll, 400)}
        />
        <button onClick={this.toggleReadOnly}>Toggle read-only mode (currently {this.state.readOnly ? 'on' : 'off' })</button>
      {/*<Row>
        <Col span={8}>
          <Select onChange={this.onPointSelected}>
            {(Object.values(points) || []).map(point => (<Option value={point.id}>point.title</Option>))}
          </Select>
        </Col>
      </Row>*/}
      </div>
    );
  };
};

export default Code;

