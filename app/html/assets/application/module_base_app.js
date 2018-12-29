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

window.ARTabs = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: null, 
    };

    if (this.props.onInit) this.props.onInit(this);
  }

  componentDidMount() {
    if (this.props.children.length > 0 && this.state.key == null) {
      this.setState({key: this.props.children[0].key ? this.props.children[0].key : 1});
    }
  }

  componentDidUpdate() {
    if (this.props.onChange) this.props.onChange(this);
  }

  render() {
    return React.createElement(ReactBootstrap.Tabs, {
        id: 'tabs', 
        activeKey: this.state.key, 
        onSelect: (key) => {
          this.setState({key: key});
        }
      }, 
      this.props.children.map((el, idx) => React.createElement(ReactBootstrap.Tab, {
        key: el.key ? el.key : (idx+1), eventKey: el.key ? el.key : (idx+1), title: el.props.title ? el.props.title : 'Tab ' + (idx+1)
      }, el))
    );
  }
}

window.ARSlider = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value || 5
    };

    if (this.props.onInit) this.props.onInit(this);
  }

  componentWillMount() {
    if (this.props.onBeforeLoad) this.props.onBeforeLoad(this);
  }

  componentDidMount() {
    if (this.props.onAfterLoad) this.props.onAfterLoad(this);
  }

  componentDidUpdate() {
    if ((! this.last_value) || (this.last_value != this.state.value)) {
      this.last_value = this.state.value;
      this.props.onChange(this);
    }
  }

  value() {
    return this.state.value;
  }

  render() {
    return React.createElement(Slider.default, {
      min: this.props.min || 0, 
      max: this.props.max || 10, 
      step: this.props.step || 1, 
      value: this.state.value, 
      onChange: (value) => {
        this.setState({value: value});
      }, 
    });
  }
}

window.ARButton = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      label: this.props.label || 'Button', 
    };

    if (this.props.onInit) this.props.onInit(this);
  }

  componentWillMount() {
    if (this.props.onBeforeLoad) this.props.onBeforeLoad(this);
  }

  componentDidMount() {
    if (this.props.onAfterLoad) this.props.onAfterLoad(this);
  }

  componentDidUpdate() {
    if (this.props.onAfterLoad) this.props.onAfterLoad(this);
  }

  label(label) {
    this.setState({
      label: label
    });
  }

  label() {
    return this.state.label;
  }

  click() {
    if(this.props.onClick) this.props.onClick();
  }

  render() {
    return React.createElement(ReactBootstrap.Button, { className: 'form-control', 
      onClick: () => {
        if(this.props.onClick) this.props.onClick();
      } 
    }, this.state.label);
  }
}

window.ARSelect = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: this.props.options || [], 
      value: this.props.multiple ? [] : ((this.props.options || []).length > 0 ? this.props.options[0].value : null), 
    };

    if (this.props.onInit) this.props.onInit(this);
  }

  componentWillMount() {
    if (this.props.onBeforeLoad) this.props.onBeforeLoad(this);
  }

  componentDidMount() {
    this.$el = $(this.el);
    this.$el
      .on('loaded.bs.select', function (e) {
        var cont = $(e.target).parents().filter(function() {
          if ($(this).hasClass('bootstrap-select')) return true;
          return false;
        });

        $(cont).addClass('form-control');
        $(cont).find('button').addClass('form-control').removeClass('btn-default');
      })
      .on('changed.bs.select', e => {
        this.setState({value: $(e.target).val()});
        if (this.props.onChange) this.props.onChange(this);
      })
      .selectpicker(this.props);

      if (this.props.onAfterLoad) this.props.onAfterLoad(this);
  }

  componentDidUpdate() {
    this.$el.selectpicker('refresh');
    if (this.props.onAfterLoad) this.props.onAfterLoad(this);
  }

  options(options) {
    this.$el.selectpicker('deselectAll');
    this.setState({
      options: options, 
      value: this.props.multiple ? [] : ((options || []).length > 0 ? options[0].value : null), 
    });
  }

  value() {
    return this.state.value;
  }

  render() {
    return React.createElement('select', {
        ref: el => this.el = el, 
        multiple: (this.props.multiple || false) 
      }, 
      this.state.options.map((d, idx) => React.createElement('option', { key: idx, value: d.value }, d.label))
    );
  }
}

window.ARFormControl = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: 'show' in this.props ? this.props.show : true, 
    };

    this.class_el = React.createElement(this.props.class, _.assign({
      ref: (el) => {
        this.class_impl = el;
      }, 
      onBeforeLoad: (el) => {
        if (this.props.onBeforeLoad) this.props.onBeforeLoad(el);
      }, 
      onAfterLoad: (el) => {
        if (this.props.onAfterLoad) this.props.onAfterLoad(el);
      }, 
      onChange: (el) => {
        if (this.props.onChange) this.props.onChange(el);
      }, 
      onClick: (el) => {
        if (this.props.onClick) this.props.onClick(el);
      }, 
    }, this.props.class_props));

    if (this.props.onInit) this.props.onInit(this);
  }

  show() {
    this.setState({show: true});
  }

  hide() {
    this.setState({show: false});
  }

  impl() {
    return this.class_impl;
  }

  render() {
    return this.state.show ? React.createElement(ReactBootstrap.FormGroup, {}, 
        this.props.title ? React.createElement(ReactBootstrap.ControlLabel, {}, this.props.title) : null, 
        this.class_el, 
        this.props.help ? React.createElement(ReactBootstrap.HelpBlock, {}, this.props.help) : null,
      ) : null;
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

window.ARImage = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    if (this.props.onInit) this.props.onInit(this);
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

