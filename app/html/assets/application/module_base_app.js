window.AR.BaseModule = class extends React.Component {
	constructor(props) {
    super(props);

    this.state = {
      dataset_id: null, 
      dataset_changing: false,
    };
  }

  app() {
    return this.props.app;
  }

  module_info() {
    return this.props.module_info;
  }

  datasets() {
    return this.app().selected_datasets();
  }

  dataset() {
    return this.state.dataset_id ? this.datasets()[this.state.dataset_id] : null;
  }

  dataset_var() {
    return this.dataset() ? 'df' + this.dataset().idx : null;
  }

  dataset_name() {
    return this.dataset().label;
  }

  eval_file(filename, params, callback, progress) {
    var files = this.props.module_info.files.filter(f => f.filename == filename);
    if (files.length == 0) {
      if (callback) callback("Error: File having name \"{0}\" is not found!".format(filename));
      return;
    } 
    else if (files.length > 1) {
      if (callback) callback("Error: There are multiple file having name \"{0}\". Rename it into different name!".format(filename));
      return;
    }

    // eval_file_id(files[0].id, params, callback)

    AnalevR.eval_file({
      'id': files[0].id, 
      'params': params, 
      'onProgress': (message) => {
        if (progress) progress(message);
      }, 
      'onSuccess': (message) => {
        if (callback) callback(message);
      }, 
      'onFailed': (message) => {
        if (callback) callback('Error! message: {0}'.format(message));
      },
    });
  }
}

window.AR.FormGroup = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true || this.props.show, 
      title: this.props.title, 
      help: this.props.help, 
      // class: this.props.type.class,
    };
  }

  componentWillUpdate() {
    if ('type' in this.props) {
      if ('ref' in this.props.type) {
        this.props.type.ref(this.refs.class_ref);
      }
    }
  }

  show() {
    this.setState({show: true});
  }

  hide() {
    this.setState({show: false});
  }

  title(title) {
    this.setState({title: title});
  }

  help(help) {
    this.setState({help: help});
  }

  render() {
    var props = _.assign({}, { ref: 'class_ref' }, 'type' in this.props ? ('props' in this.props.type ? this.props.type.props : {}) : {});

    return this.state.show ? React.createElement(ReactBootstrap.FormGroup, {}, 
        this.state.title ? React.createElement(ReactBootstrap.ControlLabel, {}, this.state.title) : null, 
        'type' in this.props ? (
          'class' in this.props.type ? (
            'children' in this.props.type ? 
              React.createElement(this.props.type.class, props, this.props.type.children) : 
              React.createElement(this.props.type.class, props)
          ) : null
        ) : null, 
        this.state.help ? React.createElement(ReactBootstrap.HelpBlock, {}, this.state.help) : null,
      ) : null;
  }
}

window.AR.Tabs = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: null, 
    };
  }

  componentDidMount() {
    for (var c=0; c<(this.props.children || []).length; c++) {
      var el = this.props.children[c];
      if ('selected' in el.props) {
        if (el.props.selected) {
          this.setState((prevState) => {
            return {...prevState, 
              ['key']: el.key, 
            }
          });
          break;
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.onChange && prevState.key !== this.state.key) this.props.onChange(this);
  }

  render() {
    return React.createElement(ReactBootstrap.Tabs, {
        id: 'tabs', 
        activeKey: this.state.key, 
        onSelect: (key) => {
          this.setState((prevState) => {
            return {...prevState, 
              ['key']: key, 
            }
          });
        }
      }, 
      this.props.children.map((el, idx) => {
        return React.createElement(ReactBootstrap.Tab, {
          key: _.get(el, 'key', (idx+1)), 
          eventKey: _.get(el, 'key', (idx+1)), 
          title: _.get(el.props, 'title', 'Tab ' + (idx+1)), 
        }, el);
      })
    );
  }
}

window.AR.Image = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.$el = $(this.el);
  }

  set_src(src) {
    this.$el.attr('src', src);
  }

  set_src_base64(src) {
    this.$el.attr('src', 'data:image/png;base64, ' + src);
  }

  render() {
    return React.createElement('img', _.assign({ref: el => this.el = el}, this.props));
  }
}

window.ARCodeMirror = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    if (this.props.el) this.props.beforeMount(this);
  }

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea($(this.el)[0], {
      'mode': 'r',
      'lineNumbers': true,
      'lineSeparator': '\n', 
      'indentUnit': 2,
      'readOnly': true,
      'scrollbarStyle': 'overlay'
    });
  }

  clear() {
    this.editor.getDoc().setValue('');
  }

  value(text) {
    this.editor.getDoc().setValue(text);
  }

  append(text) {
    var val = (this.editor.getDoc().getValue() ? this.editor.getDoc().getValue() + '\n' : '') + text;
    this.editor.getDoc().setValue(val);
  }

  render() {
    return React.createElement('textarea', {
      ref: (el) => this.el = el, 
    });
  }
}
