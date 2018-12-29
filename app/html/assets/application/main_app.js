function list_all_datasets() {
  return new Promise((resolve, reject) => {
    // analev_call('data.get_catalogues', [], (req_id, resp) => {
    //   resp = JSON.parse(resp);
    //   if (resp.success) {
    //     resolve(resp.data);
    //   } else {
    //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
    //     reject(resp.data);
    //   }
    // });

    AnalevR.call({
      'function': 'data.get_catalogues', 
      'params': [],   
      'onSuccess': (message) => resolve(message), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

function list_all_modules() {
  return new Promise((resolve, reject) => {
    // analev_call('module.all', [], (req_id, resp) => {
    //   resp = JSON.parse(resp);
    //   if (resp.success) {
    //     resolve(resp.data);
    //   } else {
    //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
    //     reject(resp.data);
    //   }
    // });

    AnalevR.call({
      'function': 'module.all', 
      'params': [],   
      'onSuccess': (message) => resolve(message), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

function select_dataset(id, df) {
  return new Promise((resolve, reject) => {
    // analev_call('data.read', [id, df], (req_id, resp) => {
    //   resp = JSON.parse(resp);
    //   if (resp.success) {
    //     var csv = Papa.parse(resp.data);
    //     resolve(csv.data);
    //   } else {
    //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
    //     reject(resp.data);
    //   }
    // });

    AnalevR.call({
      'function': 'data.read', 
      'params': [id, df],   
      'onSuccess': (message) => resolve(Papa.parse(message).data), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

function read_module_ui_file(module_id) {
  return new Promise((resolve, reject) => {
      // analev_call('module.file.ui.read', [module_id], function(req_id, resp) {
      //     resp = JSON.parse(resp);
      //     if (resp.success) {
      //       resolve(resp.data);
      //     } else {
      //       sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
      //       reject(resp.data);
      //     }
      // });

    AnalevR.call({
      'function': 'module.file.ui.read', 
      'params': [module_id],   
      'onSuccess': (message) => resolve(message), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

function session_save(data) {
  return new Promise((resolve, reject) => {
    // analev_call('session.save', [JSON.stringify(data)], (req_id, resp) => {
    //   resp = JSON.parse(resp);
    //   if (resp.success) {
    //     resolve(resp.data);
    //   } else {
    //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
    //     reject(resp.data);
    //   }
    // });

    AnalevR.call({
      'function': 'session.save', 
      'params': [JSON.stringify(data)],   
      'onSuccess': (message) => resolve(message), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

function session_load() {
  return new Promise((resolve, reject) => {
    // analev_call('session.read', [], (req_id, resp) => {
    //   resp = JSON.parse(resp);
    //   if (resp.success && resp.data != "") {
    //     resolve(resp.data);
    //   } else {
    //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
    //     reject(resp.data);
    //   }
    // });

    AnalevR.call({
      'function': 'session.read', 
      'params': [],   
      'onSuccess': (message) => resolve(message), 
      'onFailed': (message) => {
        sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
        reject(message);
      }, 
    });
  });
}

window.MainApp = class extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
      datasets: null, 
      datasets_should_update: true, 
      modules: null, 
      modules_should_update: true, 
    };
  }

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

  componentDidMount(props, state) {
    session_load().then(d => {
      var saved_data = JSON.parse(d);

      this.setState((prevState, props) => {
        return {...prevState, 
          ['datasets']: Object.keys(saved_data.datasets).map(id => {
              return {
                id: id, 
                idx: saved_data.datasets[id], 
                selected: true, 
                loaded: false, 
              };
            }).reduce((obj, d) => {
              obj[d.id] = d;
              return obj;
            }, {}), 
          ['modules']: saved_data.modules.map(id => {
              return {
                id: id, 
                selected: true, 
                loaded: false,
              };
            }).reduce((obj, d) => {
              obj[d.id] = d;
              return obj;
            }, {}), 
        };
      });
    });
  }

  componentDidUpdate(props, prevState) {
    if (this.state.datasets_should_update) {
      this.setState((prevState, props) => {
        return {...prevState, 
          ['datasets_should_update']: false, 
        };
      });

      this.load_datasets();
    } else if (prevState.datasets_should_update != this.state.datasets_should_update) {
      setTimeout(() => {
        this.setState((prevState, props) => {
          return {...prevState, 
            ['datasets_should_update']: true, 
          };
        });
      }, 60 * 1000);
    }

    if (this.state.modules_should_update) {
      this.setState((prevState, props) => {
        return {...prevState, 
          ['modules_should_update']: false, 
        };
      });

      this.load_modules();
    } else if (prevState.modules_should_update != this.state.modules_should_update) {
      setTimeout(() => {
        this.setState((prevState, props) => {
          return {...prevState, 
            ['modules_should_update']: true, 
          };
        });
      }, 100 * 1000);
    }

    // Save changes to json file
    var datasets = this.state.datasets || {}; 
    var modules = this.state.modules || {};

    var datasets_changes = JSON.stringify(_.entries(datasets)) != JSON.stringify(_.entries(prevState.datasets || {}));
    var modules_changes = JSON.stringify(_.entries(modules)) != JSON.stringify(_.entries(prevState.modules || {}));

    if (datasets_changes || modules_changes) {
      var selected_datasets = _.filter(Object.values(datasets), (d) => d.selected);
      var selected_modules = _.filter(Object.values(modules), (d) => d.selected);

      if (selected_datasets.length > 0 || selected_modules.length > 0) {
        var saved_data = {
          'datasets': _.orderBy(selected_datasets, ['idx'], ['asc'])
            .reduce((obj, d) => { obj[d.id] = d.idx; return obj; }, {}), 
          'modules': selected_modules.map(d => d.id), 
        };

        session_save(saved_data).then(() => console.log('Changes saved'));
      }
    }
  }

  load_datasets() {
    list_all_datasets().then((od) => {
      var datasets = this.datasets() || {};

      od.forEach((d) => {
        if (Object.keys(datasets).includes(d.id)) {
          datasets[d.id] =  _.extend(datasets[d.id], d);
        } else {
          datasets[d.id] =  _.extend(d, { selected: false });
        }
      });

      var od_keys = od.map(d => d.id);
      Object.values(datasets).forEach(d => {
        if (! od_keys.includes(d.id)) {
          delete datasets[d.id];
        }
      });

      this.setState((prevState, props) => {
        return {...prevState, 
          ['datasets']: {...datasets}, 
        };
      });

      Object.values(this.datasets()).filter(d => d.selected).forEach(d => {
        this.select_dataset(d.id, d.idx);
      });
    });
  }

  select_dataset(id, idx=null) {
    // Generate index
    if (idx == null) {
      if (!('idx' in this.datasets()[id])) {
        var idxs = Object.values(this.datasets()).filter(d => ('idx' in d));
        this.datasets()[id].idx = idxs.length;
      }
    } else {
      this.datasets()[id].idx = idx;
    }

    select_dataset(id, 'df{0}'.format(this.datasets()[id].idx)).then((tbl) => {
      this.setState((prevState, props) => {
        return {...prevState, 
          ['datasets']: {...this.datasets(), 
            [id]: {...this.datasets()[id], 
              ['variables']: tbl[0], 
              ['preview']: tbl, 
              ['selected']: true, 
              ['loaded']: true, 
            }
          }, 
        };
      });
    });
  }

  load_modules() {
    list_all_modules().then((od) => {
      var modules = this.modules() || {};

      od.forEach((d) => {
        if (! ('id' in d)) return;
        if ('files' in d) d.files = JSON.parse(d.files);

        if (Object.keys(modules).includes(d.id)) {
          modules[d.id] =  _.extend(modules[d.id], d);
        } else {
          modules[d.id] =  _.extend(d, { selected: false });
        }
      });

      var od_keys = od.map(d => d.id);
      Object.values(modules).forEach(d => {
        if (! od_keys.includes(d.id)) delete modules[d.id]
      });

      this.setState((prevState, props) => {
        return {...prevState, 
          ['modules']: {...modules}, 
        };
      });

      Object.values(this.modules()).filter(d => d.selected).forEach(d => {
        this.select_module(d.id);
      });
    });
  }

  select_module(id) {
    read_module_ui_file(id).then((d) => {
      this.modules()[id].src = d.content;

      this.load_script(this.modules()[id], () => {
        this.setState((prevState, props) => {
          return {...prevState, 
            ['modules']: {...this.modules(), 
              [id]: {...this.modules()[id], 
                ['selected']: true, 
                ['loaded']: true, 
              }
            }, 
          };
        });
      });
    });
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
        console.log('Module "' + module.label + '" is loaded');
        if (fn_success) fn_success();
      }
    }
  }

  unload_script(module, fn_success) {
    var elem = document.getElementById('module_' + module.id), 
      clazz = module.name;

    if(elem) {
      delete window[clazz];
      elem.parentNode.removeChild(elem);

      console.log('module_' + module.label + ' is unloaded');

      if (fn_success) fn_success();
    } else {
      console.log('module_' + module.label + ' is failed to unload');
    }
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
                            disabled: !d.loaded, 
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
                            disabled: !d.loaded, 
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
                              this.setState((prevState, props) => {
                                return {
                                  ['datasets']: {...this.datasets(), 
                                    [d.id]: {...this.datasets()[d.id], 
                                      ['selected']: false,
                                    }, 
                                  }, 
                                };
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
                            disabled: !(d.loaded && Object.values(this.datasets()).filter(d => d.loaded).length > 0), 
                            onClick: () => {
                              this.refs.result_panel.add(d.id, d.label, React.createElement(eval(d.name), {
                                app: this, 
                                module_info: d, 
                              }));
                            }
                          }, React.createElement('span', {
                            className: 'ti-blackboard'
                          })), 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Reload module', 
                            onClick: () => {
                              read_module_ui_file(d.id).then(f => {
                                var modules = this.modules();
                                modules[d.id].src = f.content;

                                this.unload_script(modules[d.id], () => {
                                  this.load_script(modules[d.id], () => {});
                                });
                              });
                            }
                          }, React.createElement('span', {
                            className: 'ti-reload'
                          })), 
                          React.createElement(ReactBootstrap.Button, {
                            title: 'Unload module', 
                            onClick: () => {
                              this.unload_script(this.modules()[d.id], () => {
                                this.setState((prevState, props) => {
                                  return {
                                    ['modules']: {...this.modules(), 
                                      [d.id]: {...this.modules()[d.id], 
                                        ['selected']: false,
                                      }, 
                                    }, 
                                  };
                                });
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
        // React.createElement('div', { className: 'card alert' }, 
        //   React.createElement('div', { className: 'card-header' }), 
        //   React.createElement('div', { className: 'card-body' }, 
            React.createElement(ResultPanel, { ref: 'result_panel' }), 
        //   )
        // )
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
                      this.app().select_dataset(id);
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

              // analev_eval(cmd, (req_id, resp) => {
              //   resp = JSON.parse(resp);
              //   if (resp.success) {
              //     if (resp.data.type == 'image') {
              //       this.setState({ visualization_base64_image: resp.data.text });
              //     }
              //   } else {
              //     sweetAlert('Oops...', 'An error happened with message "' + resp.data + '"', "error");
              //   }
              // });

              AnalevR.eval({
                'command': cmd,
                'onProgress': (message) => {}, 
                'onSuccess': (message) => {
                  if (message.type == 'image') {
                    this.setState({ visualization_base64_image: message.text });
                  }
                }, 
                'onFailed': (message) => {
                  sweetAlert('Oops...', 'An error happened with message "' + message + '"', "error");
                }, 
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
                      this.app().select_module(m.id);
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
    return Object.keys(this.state.tabs).length > 0 ? 
      React.createElement('div', { className: 'card alert' }, 
        React.createElement('div', { className: 'card-header' }), 
        React.createElement('div', { className: 'card-body' }, 
          React.createElement('div', {}, 
            React.createElement('a', {
              href: '#', 
              style: {float: 'right', padding: '7px'}, 
              title: 'Close tab ' + this.state.tabs[this.state.activeKey].title, 
              onClick: () => this.remove(this.state.activeKey)
            }, 
              React.createElement('span', {className: 'ti-close'})
            ), 
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
          )
        )
      ) : null;
  }
}