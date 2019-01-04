import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';
import isEqual from 'lodash.isequal';
import debounce from 'lodash.debounce';

function normalizeLineEndings(str) {
	if (!str) return str;
	return str.replace(/\r\n|\r/g, '\n');
}

class ReactCodeMirror extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
    }
  }
  UNSAFE_componentWillMount() {
    if (this.props.path) {
      console.error('Warning: react-codemirror: the `path` prop has been changed to `name`');
    }
  }
  componentDidMount() {
    const instance = this.props.codeMirrorInstance;
    this.cm = instance.fromTextArea(this.textareaNode, this.props.options);
    this.cm.on('change', this.codeMirrorValueChanged);
    this.cm.on('cursorActivity', this.cursorActivity);
    this.cm.on('scroll', this.scrollChanged);
    this.cm.on('focus', this.focusChanged.bind(this, true));
    this.cm.on('blur', this.focusChanged.bind(this, false));
    this.cm.setValue(this.props.defaultValue || this.props.value || '');
  }
  componentWillUnmount() {
    if (this.codeMirror) {
      this.cm.toTextArea();
    }
  }
  static getDrivedStateFromProps(nextProps, state) {
    console.log(this.props.value, nextProps.value);
    if (this.cm && nextProps.value !== undefined && nextProps.value !== this.props.value
      && normalizeLineEndings(this.cm.getValue()) !== normalizeLineEndings(nextProps.value)) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.cm.getScrollInfo(); 
        this.cm.setValue(nextProps.value);
        this.cm.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
      } else {
        this.cm.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === 'object') {
      for (let optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.setOptionIfChanged(optionName, nextProps.options[optionName]);
        }
      }
    }
  }
  updateProps(nextProps) {

  }
  render() {
    const editorClassName = className(
      'ReactCodeMirror',
      this.state.isFocused ? 'ReactCodeMirror--focused' : null,
      this.props.className
    );
    return (
      <div className={editorClassName}>
        <textarea
          ref={ref => this.textareaNode = ref}
          name={this.props.name || this.props.path}
          defaultValue={this.props.value}
          autoComplete="off"
          autoFocus={this.props.autoFocus}
        />
      </div>
    );
  }
  setOptionIfChanged(optionName, newValue) {
    const oldValue = this.cm.getOption(optionName);
    if (!isEqual(oldValue, newValue)) {
      this.cm.setOption(optionName, newValue);
    }
  }
  codeMirrorValueChanged = (doc, change) => {
    console.log(doc.getValue());
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change);
    }
  }
  cursorActivity = cm => {
    this.props.onCursorActivity && this.props.onCursorActivity(cm);
  }
  scrollChanged = cm => {
    this.props.onScroll  && this.props.onScroll(cm.getScrollInfo());
  }
  focusChanged = focused => {
    this.setState({
      isFocused: focused,
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

}

ReactCodeMirror.propTypes = {
  autoFocus: PropTypes.bool,
  className: PropTypes.any,
  codeMirrorInstance: PropTypes.func,
  defaultValue: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  onCursorActivity: PropTypes.func,
  onFocusChange: PropTypes.func,
  onScroll: PropTypes.func,
  options: PropTypes.object,
  path: PropTypes.string,
  value: PropTypes.string,
  preserveScrollPosition: PropTypes.bool,
}

export default ReactCodeMirror;

