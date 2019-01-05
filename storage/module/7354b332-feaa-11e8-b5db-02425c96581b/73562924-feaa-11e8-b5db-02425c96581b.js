// ui.js

window.LifeTable = class extends AR.BaseModule {
  constructor(props) {
    super(props);
    this.state = _.extend(this.state, {
      time_var: null, 
      time_var_changing: false, 
      interval: 1, 
      interval_changing: false, 
      cens_var: null, 
      cens_var_changing: false, 
      fact_var: null, 
      fact_var_changing: false, 
    });
  }

  variables() {
    return this.dataset() ? this.dataset().variables : [];
  }

  time_variables() {
    return this.variables();
  }

  censor_variables() {
    return _.difference(
      this.variables(), 
      _.concat([this.state.time_var])
    );
  }

  factor_variables() {
    return _.concat([null], _.difference(
      this.variables(), 
      _.concat([this.state.time_var])
    ));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dataset_changing) {
      this.setState((prevState) => {
        return {...prevState, ['dataset_changing']: false};
      });
    }

    if (this.state.time_var_changing) {
      this.setState((prevState) => {
        return {...prevState, ['time_var_changing']: false};
      });
    }

    if (this.state.interval_changing) {
      this.setState((prevState) => {
        return {...prevState, ['interval_changing']: false};
      });
    }

    if (this.state.cens_var_changing) {
      this.setState((prevState) => {
        return {...prevState, ['cens_var_changing']: false};
      });
    }

    if (this.state.fact_var_changing) {
      this.setState((prevState) => {
        return {...prevState, ['fact_var_changing']: false};
      });
    }
  }

  render() {
    return React.createElement('div', { className: 'row' },
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
            title: 'Survival Time Variable', 
            help: 'Select Survival Time Variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.time_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['time_var']: ev.target.value, 
                        ['time_var_changing']: !_.isEqual(prevState.time_var, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['time_var']: ev.target.value, 
                        ['time_var_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        !this.state.time_var_changing && this.state.time_var != null ? 
          React.createElement(AR.FormGroup, {
            title: 'Time Interval', 
            help: 'Enter Time Interval', 
            type: {
              class: ReactBootstrap.FormControl, 
              props: {
                type: 'text', 
                value: this.state.interval, 
                placeholder: 'Enter Time Interval', 
                onChange: (e) => {
                  this.setState((prevState) => {
                    return {...prevState, 
                      ['interval']: !_.isEmpty(e.target.value) ? _.parseInt(e.target.value) : 0, 
                      ['interval_changing']: true, 
                    }
                  });
                }, 
                style: {
                  width: '100%'
                }
              }
            },
          }) : null, 

        !this.state.time_var_changing && this.variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Censor Variable', 
            help: 'Select Censor Variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.censor_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['cens_var']: ev.target.value, 
                        ['cens_var_changing']: !_.isEqual(prevState.cens_var, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['cens_var']: ev.target.value, 
                        ['cens_var_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null, 

        !this.state.time_var_changing && this.variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Factor Variable', 
            help: 'Select Factor Variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.factor_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['fact_var']: ev.target.value, 
                        ['fact_var_changing']: !_.isEqual(prevState.fact_var, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['fact_var']: ev.target.value, 
                        ['fact_var_changing']: true, 
                      }
                    });
                  }
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
                this.result_ta.value('{0} - Initializing ...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                // this.eval_file('init', {
                //   dataset: this.dataset_var(), 
                //   dataset_name: this.dataset_name(), 
                //   time_var: this.state.time_var, 
                //   interval: this.state.interval, 
                //   cens_var: this.state.cens_var, 
                //   fact_var: this.state.fact_var, 
                // }, (data) => {
                //   if(data.type == 'plain') 
                //     this.result_ta.append('{0} - {1}'.format(moment().format("YYYY-MM-DD hh:mm:ss"), data.text));

                //   this.eval_file('process', {}, (data) => {
                //     if(data.type == 'plain') this.result_ta.value(data.text);                    
                //   });
                // });

                this.eval_file('server', {
                  dataset: this.dataset_var(), 
                  dataset_name: this.dataset_name(), 
                  time_var: this.state.time_var, 
                  interval: this.state.interval, 
                  cens_var: this.state.cens_var, 
                  fact_var: this.state.fact_var, 
                }, {
                  'onProgress': (message) => {
                    this.result_ta.append(log);
                  }, 
                  'onSuccess': (data) => {
                    if(data.type == 'plain') {
                      this.result_ta.append('\n{0} - Result:'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                      this.result_ta.append(data.text);
                    }
                  }, 
                  'onFailed': (message) => {
                    this.result_ta.append(message);
                  }
                });
              }
            }, 
            children: 'Calculate'
          },
        }), 

      ),
      React.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' },
        React.createElement(ARCodeMirror, { title: 'Result', ref: (el) => this.result_ta = el })
      )
    );
  }
}


