// ui.js

window.LinearRegressionOLS = class extends AR.BaseModule {
	constructor(props) {
    super(props);
    this.state = {
      r_var: null, 
      r_var_changing: false, 
      e_vars: [], 
      e_vars_changing: false, 
      conf_lev: 0.95, 
      conf_lev_changing: false, 
      tab: null, 
      plot_tab_error: '', 
      plot_tab_base64_image: null, 
    };
  }

  variables() {
    return this.dataset() ? this.dataset().variables : [];
  }
  
  r_variables() {
    return this.variables();
  }

  e_variables() {
    return _.difference(
      this.variables(), 
      _.concat([this.state.r_var])
    );
  }

  componentDidUpdate() {
    if (this.state.dataset_changing) {
      this.setState((prevState) => {
        return {...prevState, ['dataset_changing']: false};
      });
    }

    if (this.state.r_var_changing) {
      this.setState((prevState) => {
        return {...prevState, ['r_var_changing']: false};
      });
    }

    if (this.state.e_vars_changing) {
      this.setState((prevState) => {
        return {...prevState, ['e_vars_changing']: false};
      });
    }

    if (this.state.conf_lev_changing) {
      this.setState((prevState) => {
        return {...prevState, ['conf_lev_changing']: false};
      });
    }
  }

  render() {
  	return React.createElement('div', { className: 'row', ref: (el) => this.row = el }, 
      React.createElement('div', { className: 'col-lg-4 col-md-4 col-sm-12 col-xs-12' }, 
        React.createElement(AR.FormGroup, {
          title: 'Dataset',
          help: 'Select dataset',
          type: {
            class: ReactBootstrap.SelectPicker,
            props: {
              multiple: false,
              options: Object.values(this.datasets()).map((d) => { return { value: d.id, label: d.label } }),
              width: 'auto',
              'bs-events': {
                onLoaded: (ev) => {
                  this.setState((prevState) => {
                    return {...prevState, 
                      ['dataset_id']: ev.target.value, 
                      ['dataset_changing']: !_.isEqual(prevState.dataset_id, ev.target.value), 
                    }
                  });
                },
                onChanged: (ev) => {
                  this.setState((prevState) => {
                    return {...prevState, 
                      ['dataset_id']: ev.target.value, 
                      ['dataset_changing']: true, 
                    }
                  });
                }
              }
            }
          },
        }), 

        !this.state.dataset_changing && this.variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Response Variable', 
            help: 'Select Response Variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.r_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['r_var']: ev.target.value, 
                        ['r_var_changing']: !_.isEqual(prevState.r_var, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['r_var']: ev.target.value, 
                        ['r_var_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        !this.state.r_var_changing && this.variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Explanatory Variable', 
            help: 'Select Explanatory Variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: true, 
                options: this.e_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['e_vars']: [ev.target.value], 
                        ['e_vars_changing']: !_.isEqual(prevState.e_vars, [ev.target.value]), 
                      }
                    });
                  }, 
                  onChanged: (ev, index, isSelected) => {
                    this.setState((prevState) => {
                      var e_vars = this.state.e_vars;

                      if (isSelected) e_vars.push(this.e_variables()[index]);
                      else _.pull(e_vars, this.e_variables()[index]);

                      return {...prevState, 
                        ['e_vars']: e_vars, 
                        ['e_vars_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        this.state.tab == 'predict' ? 
          React.createElement(AR.FormGroup, {
            title: 'Confidence Level', 
            help: 'Slide to set Confidence Level', 
            type: {
              class: ReactBootstrap.Slider, 
              props: {
                min: 0.8, 
                max: 0.99, 
                step: 0.01, 
                value: this.state.conf_lev, 
                onChange: (value) => {
                  this.setState((prevState) => {
                    return {...prevState, 
                      ['conf_lev']: value, 
                      ['conf_lev_changing']: true, 
                    }
                  });
                }, 
                style: {
                  width: '100%'
                }
              }
            },
          }) : null, 

        React.createElement(AR.FormGroup, {
          type: {
            class: ReactBootstrap.Button, 
            props: {
              bsStyle: 'primary', 
              style: {
                width: '100%'
              }, 
              onClick: () => {
                if (this.state.tab == 'summary') {
                  this.eval_file('summary', {
                    dataset: this.dataset_var(), 
                    dataset_name: this.dataset_name(), 
                    r_var: this.state.r_var, 
                    e_vars: this.state.e_vars.join(':'), 
                  }, (data) => {
                    if(data.type == 'plain') this.summary_ta.value(data.text);
                  });
                }

                else if (this.state.tab == 'predict') {
                  this.eval_file('predict', {
                    dataset: this.dataset_var(), 
                    dataset_name: this.dataset_name(), 
                    r_var: this.state.r_var, 
                    e_vars: this.state.e_vars.join(':'), 
                    data_filter: "", 
                    conf_lev: this.state.conf_lev, 
                    n: 10, 
                  }, (data) => {
                    if(data.type == 'plain') this.predict_ta.value(data.text);
                  });
                }

                else if (this.state.tab == 'plot') {
                  this.setState((prevState) => {
                    return {...prevState, 
                      ['plot_tab_base64_image']: null, 
                      ['plot_tab_error']: null, 
                    }
                  });

                  this.eval_file('plot', {
                    dataset: this.dataset_var(), 
                    dataset_name: this.dataset_name(), 
                    r_var: this.state.r_var, 
                    e_vars: this.state.e_vars.join(':'), 
                    conf_lev: this.state.conf_lev, 
                  }, (data) => {
                    if (data.success) {
                      if(data.type == 'image') {
                        this.setState((prevState) => {
                          return {...prevState, 
                            ['plot_tab_base64_image']: data.text, 
                          }
                        });
                      }
                    } else {
                      this.setState((prevState) => {
                        return {...prevState, 
                          ['plot_tab_error']: data.toString(), 
                        }
                      });
                    }
                  });
                }
              }
            }, 
            children: 'Process'
          },
        }), 
      ), 

      React.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' }, 
        React.createElement(AR.Tabs, {
          onChange: (tabs) => {
            this.setState((prevState) => {
              return {...prevState, 
                ['tab']: tabs.state.key
              };
            });
          }
        }, 
          React.createElement(ARCodeMirror, {
            key: 'summary', 
            selected: true, 
            title: 'Summary', 
            ref: (el) => this.summary_ta = el
          }), 
          React.createElement(ARCodeMirror, {
            key: 'predict', 
            title: 'Predict', 
            ref: (el) => this.predict_ta = el
          }), 

          React.createElement('div', {
            key: 'plot', 
            title: 'Plot', 
            width: '100%', 
          }, 
            this.state.plot_tab_base64_image !== null ? 
              React.createElement('img', {
                width: '100%', 
                src: 'data:image/png;base64, ' + this.state.plot_tab_base64_image, 
              }) : 

            this.state.plot_tab_error !== null ? 
              this.state.plot_tab_error : null
          )
        ), 
      )
    )
  }
}





