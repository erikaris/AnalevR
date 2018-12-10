window.MainApp = class extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      datasets: null, 
      modules: null, 
    };
  }

  componentDidMount(props, state) {}

  componentDidUpdate(props, state) {}

  datasets() {
    return this.state.datasets;
  }

  selected_datasets() {
    var selected_datasets = {};
    Object.values((this.datasets() || {})).forEach(d => {
      if(d.selected) selected_datasets[d.id] = d;
    });

    return selected_datasets;
  }

  modules() {
    return this.state.modules;
  }

  load_datasets() {
    analev_call('data.get_catalogues', [], (req_id, resp) => {
      resp = JSON.parse(resp);
      if (resp.success) {
        this.setState({
          datasets: resp.data.reduce((obj, d) => {
            d.selected = false;
            obj[d.id] = d;
            return obj;
          }, {})
        });
      } else {
        sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
      }
    });
  }

  load_modules() {
    analev_call('module.all', [], (req_id, resp) => {
      resp = JSON.parse(resp);
      if (resp.success) {
        this.setState({
          modules: resp.data.reduce((obj, d) => {
            d.selected = false;
            obj[d.id] = d;
            return obj;
          }, {})
        });
      } else {
        sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
      }
    });
  }

  render() {
    return React.createElement('div', { className: 'row' }, 
      // Data selector panel
      React.createElement('div', { className: 'col-lg-5 col-md-5 col-sm-12 col-xs-12' }, 
        React.createElement('div', { className: 'card alert' }, 
          React.createElement('div', { className: 'card-header' }, 
            React.createElement('h4', { style: {lineHeight: '34px'} }, 'Datasets'), 
            React.createElement('div', { style: {float: 'right'} }, 
              React.createElement(ReactBootstrap.Button, { 
                bsStyle: 'primary', 
                title: 'Add Dataset', 
                onClick: () => {
                  this.refs.modal_dataset_selector.setState({show: true});
                }
              }, React.createElement('span', {
                className: 'ti-plus'
              }))
            ), 
          ), 
          React.createElement('div', { className: 'card-body' }, 
            React.createElement(ModalDatasetSelector, {
              ref: 'modal_dataset_selector', 
              app: this
            }), 
            React.createElement('div', { className: 'panel panel-default' }, 
              React.createElement('table', { className: 'table table-bordered' }, 
                React.createElement('tbody', {}, 
                  this.datasets() ? (
                    Object.values(this.datasets()).filter(d => d.selected).map(d => 
                      React.createElement('tr', { key: d.id }, 
                        React.createElement('td', {}, 'df' + d.idx), 
                        React.createElement('td', {}, d.label), 
                        React.createElement('td', {}, 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Preview dataset', 
                            onClick: () => {
                              this.refs.result_panel.add(d.id + '-preview', 'Preview of ' + d.label, 
                                React.createElement(PreviewDataset, {app: this, id: d.id})
                              );
                            }
                          }, React.createElement('span', {
                            className: 'ti-layout-tab-window'
                          })), 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Visualize dataset', 
                            onClick: () => {
                              this.refs.result_panel.add(d.id + '-visualization', 'Visualization of ' + d.label, 
                                React.createElement(VisualizeDataset, {app: this, id: d.id})
                              );
                            }
                          }, React.createElement('span', {
                            className: 'ti-bar-chart'
                          })), 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Remove dataset', 
                            onClick: () => {
                              var datasets = this.datasets();
                              datasets[d.id].selected = false;
                              this.setState({datasets: datasets});
                            }
                          }, React.createElement('span', {
                            className: 'ti-trash'
                          })), 
                        )
                      )
                    )
                  ) : null
                )
              )
            ), 
            this.datasets() ? (
              Object.values(this.datasets()).filter(d => d.selected).length >= 2 ? (
                React.createElement('div', {className: 'text-center'}, 
                  React.createElement(ReactBootstrap.Button, { 
                    bsStyle: 'primary', 
                    onClick: () => {}
                  }, 
                    React.createElement('span', {
                      className: 'ti-files', 
                      title: 'Merge datasets'
                    }), ' Merge Datasets'
                  )
                )
              ) : null
            ) : null
          )
        )
      ), 

      // Module selector panel
      React.createElement('div', { className: 'col-lg-7 col-md-7 col-sm-12 col-xs-12' }, 
        React.createElement('div', { className: 'card alert' }, 
          React.createElement('div', { className: 'card-header' }, 
            React.createElement('h4', { style: {lineHeight: '34px'} }, 'Modules'), 
            React.createElement('div', { style: {float: 'right'} }, 
              React.createElement(ReactBootstrap.Button, { 
                bsStyle: 'primary', 
                title: 'Load Module', 
                onClick: () => {
                  this.refs.modal_module_selector.setState({show: true});
                }
              }, React.createElement('span', {
                className: 'ti-bookmark'
              }))
            ), 
          ), 
          React.createElement('div', { className: 'card-body' }, 
            React.createElement(ModalModuleSelector, {
              ref: 'modal_module_selector', 
              app: this
            }), 
            React.createElement('div', { className: 'panel panel-default' }, 
              React.createElement('table', { className: 'table table-bordered' }, 
                React.createElement('tbody', {}, 
                  this.modules() ? (
                    Object.values(this.modules()).filter(d => d.selected).map(d => 
                      React.createElement('tr', { key: d.id }, 
                        React.createElement('td', {}, d.label), 
                        React.createElement('td', {}, 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Open Module', 
                            onClick: () => {
                              if (Object.keys(this.selected_datasets()).length == 0) {
                                sweetAlert('Oops...', 'You must select at least one dataset!', "error");
                                return;
                              }

                              this.refs.result_panel.add(d.id, d.label, React.createElement(eval(d.name), {
                                app: this, 
                                module_info: d, 
                              }));
                            }
                          }, React.createElement('span', {
                            className: 'ti-blackboard'
                          })), 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Unload module', 
                            onClick: () => {
                              this.refs.modal_module_selector.unload_script(this.modules()[d.id], () => {
                                var modules = this.modules();
                                modules[d.id].selected = false;   

                                this.refs.modal_module_selector.setState({ show: false });
                                this.setState({modules: modules});
                              });
                            }
                          }, React.createElement('span', {
                            className: 'ti-trash'
                          })), 
                        )
                      )
                    )
                  ) : null
                )
              )
            )
          )
        )
      ), 

      // Result panel
      React.createElement('div', { className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12' }, 
        React.createElement('div', { className: 'card alert' }, 
          React.createElement('div', { className: 'card-header' }), 
          React.createElement('div', { className: 'card-body' }, 
            React.createElement(ResultPanel, { ref: 'result_panel' })
          )
        )
      )
    )
  }
}

window.ModalDatasetSelector = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false, 
      loading: false, 
    };
  }

  componentDidUpdate() {
    if (! this.app().datasets() && this.state.show) {
      this.app().load_datasets();
    }
  }

  app() {
    return this.props.app;
  }

  generate_index(id) {
    if (! ('idx' in this.app().datasets()[id])) {
      var idxs = [], 
        n_ds = 0;

      Object.values(this.app().datasets()).forEach(d => {
        if ('idx' in d) idxs.push(d.idx);
        n_ds += 1;
      });

      for(var i=0; i<n_ds; i++) {
        if (! (i in idxs)) {
          this.app().datasets()[id].idx = i;
          break;
        }
      }
    }
  }

  select_dataset(id) {
    this.generate_index(id);

    analev_call('data.read', [this.app().datasets()[id].id, 'df' + this.app().datasets()[id].idx], (req_id, resp) => {
      resp = JSON.parse(resp);
      if (resp.success) {
        var data = Papa.parse(resp.data);

        var datasets = this.app().datasets();
        datasets[id].variables = data.data[0];
        datasets[id].preview = data.data;
        datasets[id].selected = true;

        this.setState({ show: false });
        this.app().setState({datasets: datasets});
      } else {
        sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
      }
    })
  }

  render() {
    return React.createElement(ReactBootstrap.Modal, {
      show: this.state.show, 
      onHide: () => this.setState({ show: false }), 
      onEntering: () => {}
    }, 
      React.createElement(ReactBootstrap.Modal.Header, { closeButton: true }, 
        React.createElement(ReactBootstrap.Modal.Title, {}, 'Select Dataset')
      ), 
      React.createElement(ReactBootstrap.Modal.Body, {}, 
        this.state.loading ? (
          React.createElement('div', {className: 'text-center'}, 
            React.createElement('img', {src: 'assets/loading-200px.gif'})
          )
        ) : (
          this.app().datasets() ? (
            React.createElement(ReactBootstrap.ListGroup, {}, 
              Object.keys(this.app().datasets()).map((id) => {
                if (! this.app().datasets()[id].selected) {
                  return React.createElement(ReactBootstrap.ListGroupItem, {
                    key: id, 
                    href: '#', 
                    onClick: () => {
                      this.select_dataset(id);
                    }
                  }, this.app().datasets()[id].label);
                }
              })
            )
          ) : (null)
        )
      ), 
      React.createElement(ReactBootstrap.Modal.Footer, {}, 
        React.createElement(ReactBootstrap.Button, {
          onClick: () => this.setState({ show: false })
        }, 'Close')
      )
    );
  }
}

window.PreviewDataset = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  app() {
    return this.props.app;
  }

  dataset() {
    return this.app().datasets()[this.props.id];
  }

  render() {
    return React.createElement(ReactBootstrap.Table, { responsive: true }, 
      React.createElement('thead', {}, 
        (this.dataset() ? 
          React.createElement('tr', {}, 
            this.dataset().preview ? this.dataset().preview[0].map((c, idx) => React.createElement('th', { key: idx }, c)) : null
          ) : null
        )
      ), 
      React.createElement('tbody', {}, 
        (this.dataset() ? 
          (this.dataset().preview ? 
            this.dataset().preview.slice(1).map((r, r_idx) => 
              React.createElement('tr', { key: r_idx }, 
                r.map((c, c_idx) => React.createElement('td', { key: c_idx }, c))
              )
            ) : null
          ) : null
        )
      )
    );
  }
}

window.VisualizeDataset = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sum_funcs: {
        n_obs: 'n_obs', n_missing: 'n_missing', n_distinct: 'n_distinct', mean: 'mean', median: 'median', min: 'min', max: 'max', sum: 'sum', var: 'var', sd: 'sd', se: 'se', cv: 'cv', prop: 'prop', varprop: 'varprop', sdprop: 'sdprop', seprop: 'seprop', varpop: 'varpop', sdpop: 'sdpop', skew: 'skew', kurtosi: 'kurtosis'
      }, 
      plot_type: null, 
      x_var: null, 
      y_var: null, 
      sum_func: 'mean', 
      visualization_base64_image: null, 
    }
  }

  app() {
    return this.props.app;
  }

  dataset() {
    return this.app().datasets()[this.props.id];
  }

  df() {
    return this.dataset() ? 'df' + this.dataset().idx : null;
  }

  render() {
    return React.createElement('div', { className: 'row' }, 
      React.createElement('div', { className: 'col-lg-4 col-md-4 col-sm-12 col-xs-12' }, 
        React.createElement(ReactBootstrap.FormGroup, {}, 
          React.createElement(ReactBootstrap.ControlLabel, {}, 'Plot Type'), 
          React.createElement('select', {
            className: 'form-control', 
            onChange: (ev) => this.setState({ plot_type: ev.target.value })
          }, 
            React.createElement('option', { value: '' }, 'None'), 
            React.createElement('option', { value: 'bar' }, 'Bar'), 
            React.createElement('option', { value: 'line' }, 'Line')
          ), 
          React.createElement(ReactBootstrap.HelpBlock, {}, 'Select plot type')
        ), 
        this.render_options_by_type(), 
        React.createElement(ReactBootstrap.FormGroup, {}, 
          React.createElement(ReactBootstrap.Button, {
            className: 'form-control', 
            onClick: () => {
              var cmd = (
                "library(dplyr) \n" + 
                "library(ggplot2) \n\n" + 
                
                "tmp <- {0} %>% \n" + 
                  "group_by_at(.vars = '{1}') %>% \n" + 
                  "select_at(.vars = '{2}') %>% \n" + 
                  "na.omit() %>% \n" + 
                  "summarise_all('{3}') \n" + 

                "ggplot(tmp, aes_string(x = '{1}', y = '{2}')) + " + 
                "geom_bar(stat = 'identity', position = 'dodge') + " + 
                "theme(legend.position = 'none')"
              ).format(
                this.df(), 
                this.state.x_var, 
                this.state.y_var, 
                this.state.sum_func
              );

              analev_eval(cmd, (req_id, resp) => {
                resp = JSON.parse(resp);
                if (resp.success) {
                  if (resp.data.type == 'image') {
                    this.setState({ visualization_base64_image: resp.data.text });
                  }
                } else {
                  sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
                }
              });
            }
          }, 'Generate Plot')
        ),
      ), 
      React.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' }, 
        (this.state.visualization_base64_image ? React.createElement('img', { 
          style: { width: '100%' }, 
          src: 'data:image/png;base64,' + this.state.visualization_base64_image 
        }) : null)
      )
    );
  }

  render_options_by_type() {
    var elements = [];

    if (this.state.plot_type == 'bar' || this.state.plot_type == 'line') {
      elements.push(
        React.createElement(ReactBootstrap.FormGroup, { key: 'x' }, 
          React.createElement(ReactBootstrap.ControlLabel, {}, 'X Variable'), 
          React.createElement('select', { className: 'form-control', onChange: (ev) => this.state.x_var = ev.target.value }, 
            React.createElement('option', { value: '' }, 'None'), 
            this.dataset().variables.map((v, idx) => React.createElement('option', { key: idx, value: v }, v))
          ), 
          React.createElement(ReactBootstrap.HelpBlock, {}, 'Select X variable')
        ), 
        React.createElement(ReactBootstrap.FormGroup, { key: 'y' }, 
          React.createElement(ReactBootstrap.ControlLabel, {}, 'Y Variable'), 
          React.createElement('select', { className: 'form-control', onChange: (ev) => this.state.y_var = ev.target.value }, 
            React.createElement('option', { value: '' }, 'None'), 
            this.dataset().variables.map((v, idx) => React.createElement('option', { key: idx, value: v }, v))
          ), 
          React.createElement(ReactBootstrap.HelpBlock, {}, 'Select Y variable')
        ), 
        React.createElement(ReactBootstrap.FormGroup, { key: 'fn' }, 
          React.createElement(ReactBootstrap.ControlLabel, {}, 'Apply Function'), 
          React.createElement('select', {
            className: 'form-control', 
            onChange: (ev) => this.setState({ sum_func: ev.target.value })
          }, 
            Object.keys(this.state.sum_funcs).map(v => 
              React.createElement('option', { key: v, value: v }, this.state.sum_funcs[v])
            )
          ), 
          React.createElement(ReactBootstrap.HelpBlock, {}, 'Select function to apply')
        )
      );
    }

    return elements;
  }
}

window.ModalModuleSelector = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false, 
      loading: false, 
    };
  }

  componentDidUpdate() {
    if (! this.app().modules() && this.state.show) {
      this.app().load_modules();
    }
  }

  app() {
    return this.props.app;
  }

  load_script(module, fn_success) {
    var text = module.src, 
      clazz = module.name;

    if (typeof window[clazz] != 'undefined') {
      console.log('Module "' + module.label + '" has been already loaded')
    } else {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = text;
      script.id = 'module_' + module.id;

      document.body.appendChild(script);

      if (typeof window[clazz] != 'undefined') {
        if (fn_success) fn_success();
        console.log('Module "' + module.label + '" is loaded');
      }
    }
  }

  unload_script(module, fn_success) {
    var elem = document.getElementById('module_' + module.id), 
      clazz = module.name;

    delete window[clazz];

    if(elem) {
      elem.parentNode.removeChild(elem);
      if (fn_success) fn_success();

      console.log('module_' + module.label + ' is unloaded');
    } else {
      console.log('module_' + module.label + ' is failed to unload');
    }
  }

  select_module(id) {
    analev_call('module.file.ui.read', [id], (req_id, resp) => {
      resp = JSON.parse(resp);
      if (resp.success) {
        var modules = this.app().modules();
        modules[id].src = resp.data.content;

        this.load_script(modules[id], () => {
          modules[id].selected = true;   

          this.setState({ show: false });
          this.app().setState({modules: modules});
        });
      } else {
        sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
      }
    });
  }

  render() {
    return React.createElement(ReactBootstrap.Modal, {
      show: this.state.show, 
      onHide: () => this.setState({ show: false }), 
      onEntering: () => {}
    }, 
      React.createElement(ReactBootstrap.Modal.Header, { closeButton: true }, 
        React.createElement(ReactBootstrap.Modal.Title, {}, 'Select Module')
      ), 
      React.createElement(ReactBootstrap.Modal.Body, {}, 
        this.state.loading ? (
          React.createElement('div', {className: 'text-center'}, 
            React.createElement('img', {src: 'assets/loading-200px.gif'})
          )
        ) : (
          this.app().modules() ? (
            React.createElement(ReactBootstrap.ListGroup, {}, 
              Object.values(this.app().modules())
                .filter(m => !m.selected)
                .map(m => React.createElement(ReactBootstrap.ListGroupItem, {
                    key: m.id, 
                    href: '#', 
                    onClick: () => {
                      this.select_module(m.id);
                    }
                  }, m.label, 
                  React.createElement('small', {}, ' by ' + m.owner_name)))
            )
          ) : (null)
        )
      ), 
      React.createElement(ReactBootstrap.Modal.Footer, {}, 
        React.createElement(ReactBootstrap.Button, {
          onClick: () => this.setState({ show: false })
        }, 'Close')
      )
    );
  }
}

window.ResultPanel = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: null, 
      tabs: {}
    };
  }

  add(id, title, content) {
    var tabs = this.state.tabs;
    if(!(id in tabs)) {
      tabs[id] = {title: title, id: id, content: content};
    }

    this.setState({
      activeKey: id, 
      tabs: tabs
    });
  }

  remove(id) {
    var tabs = this.state.tabs;
    delete tabs[id];

    var activeKey = this.state.activeKey;
    if (activeKey == id) {
      if (Object.keys(tabs).length > 0) activeKey = Object.keys(tabs)[0];
      else activeKey = null;
    }

    this.setState({
      activeKey: activeKey, 
      tabs: tabs
    });
  }

  render() {
    return React.createElement('div', {}, 
      Object.keys(this.state.tabs).length > 0 ? 
        React.createElement('a', {
          href: '#', 
          style: {float: 'right', padding: '7px'}, 
          title: 'Close tab ' + this.state.tabs[this.state.activeKey].title, 
          onClick: () => this.remove(this.state.activeKey)
        }, 
          React.createElement('span', {className: 'ti-close'})
        ) : null, 
      React.createElement(ReactBootstrap.Tabs, {
        id: 'result_tabs', 
        activeKey: this.state.activeKey, 
        onSelect: (key) => {
          this.setState({activeKey: key});
        }
      }, 
        Object.values(this.state.tabs).map(t => 
          React.createElement(ReactBootstrap.Tab, {title: t.title, eventKey: t.id, key: t.id}, t.content)
        )
      )
    );
  }
}