// ui.js

window.SAE_FHME = class extends AR.BaseModule {
  constructor(props) {
    super(props);
    this.state = _.extend(this.state, {
      y_changing: false, 
      y: null,       
      mse_y_changing: false, 
      mse_y: null,       
      x_changing: false, 
      x: [],       
      mse_x_changing: false, 
      mse_x: [], 
    });
  }

  variables() {
    return this.dataset() ? this.dataset().variables : [];
  }

  y_variables() {
    return this.variables();
  }

  mse_y_variables() {
    return _.difference(
      this.variables(), 
      _.concat([this.state.y], this.state.x, this.state.mse_x)
    );
  }

  x_variables() {
    return _.difference(
      this.variables(), 
      _.concat([this.state.y], [this.state.mse_y], this.state.mse_x)
    );
  }

  mse_x_variables() {
    return _.difference(
      this.variables(), 
      _.concat([this.state.y], [this.state.mse_y], this.state.x)
    );
  }

  componentDidUpdate() {
    if (this.state.dataset_changing) {
      this.setState((prevState) => {
        return {...prevState, ['dataset_changing']: false};
      });
    }

    if (this.state.y_changing) {
      this.setState((prevState) => {
        return {...prevState, ['y_changing']: false};
      });
    }

    if (this.state.mse_y_changing) {
      this.setState((prevState) => {
        return {...prevState, ['mse_y_changing']: false};
      });
    }

    if (this.state.x_changing) {
      this.setState((prevState) => {
        return {...prevState, ['x_changing']: false};
      });
    }

    if (this.state.mse_x_changing) {
      this.setState((prevState) => {
        return {...prevState, ['mse_x_changing']: false};
      });
    }

    // if (this.state.dataset_changing) {
    //   this.setState({
    //     variables: this.dataset().variables, 
    //     dataset_changing: false,
    //   });
    // }

    // if (!_.isEqual(prevState.y, this.state.y)) this.setState({y_changing: true});
    // if (this.state.y_changing) this.setState({y_changing: false});

    // if (!_.isEqual(prevState.mse_y, this.state.mse_y)) this.setState({mse_y_changing: true});
    // if (this.state.mse_y_changing) this.setState({mse_y_changing: false});

    // if (!_.isEqual(prevState.x, this.state.x)) this.setState({x_changing: true});
    // if (this.state.x_changing) this.setState({x_changing: false});

    // if (!_.isEqual(prevState.mse_x, this.state.mse_x)) this.setState({mse_x_changing: true});
    // if (this.state.mse_x_changing) this.setState({mse_x_changing: false});
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
              options: Object.values(this.datasets()).map((d) => { return {value: d.id, label: d.label} }), 
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
            title: 'Direct Estimator', 
            help: 'Vector of direct estimation for each area', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.y_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['y']: ev.target.value, 
                        ['y_changing']: !_.isEqual(prevState.y, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['y']: ev.target.value, 
                        ['y_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        !this.state.y_changing && !this.state.x_changing && !this.state.mse_x_changing && 
        this.mse_y_variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'MSE of y', 
            help: 'Vector of design variance of variable y', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.mse_y_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['mse_y']: ev.target.value, 
                        ['mse_y_changing']: !_.isEqual(prevState.mse_y, ev.target.value), 
                      }
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['mse_y']: ev.target.value, 
                        ['mse_y_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        !this.state.y_changing && !this.state.mse_y_changing && !this.state.mse_x_changing && 
        this.x_variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Auxiliary variables', 
            help: 'matrix of auxiliary variable from another survey. It may more includes more than one column.', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: true, 
                options: this.x_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['x']: [ev.target.value], 
                        ['x_changing']: !_.isEqual(prevState.x, [ev.target.value]), 
                      }
                    });
                  }, 
                  onChanged: (ev, index, isSelected) => {
                    var x = this.state.x;

                    if (isSelected) x.push(this.x_variables()[index]);
                    else _.pull(x, this.x_variables()[index]);

                    this.setState((prevState) => {
                      return {...prevState, 
                        ['x']: x, 
                        ['x_changing']: true, 
                      }
                    });
                  }
                }
              }
            },
          }) : null,

        !this.state.y_changing && !this.state.mse_y_changing && !this.state.x_changing && 
        this.mse_x_variables().length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'MSE of Auxiliary variables', 
            help: 'matrix of variance of variable x. It may more includes more than one column.', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: true, 
                options: this.mse_x_variables().map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState((prevState) => {
                      return {...prevState, 
                        ['mse_x']: [ev.target.value], 
                        ['mse_x_changing']: !_.isEqual(prevState.mse_x, [ev.target.value]), 
                      }
                    });
                  }, 
                  onChanged: (ev, index, isSelected) => {
                    var mse_x = this.state.mse_x;

                    if (isSelected) mse_x.push(this.mse_x_variables()[index]);
                    else _.pull(mse_x, this.mse_x_variables()[index]);

                    this.setState((prevState) => {
                      return {...prevState, 
                        ['mse_x']: mse_x, 
                        ['mse_x_changing']: true, 
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
                this.estimation_ta.value('{0} - Initializing ...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                this.eval_file('init', {
                  dataset: this.dataset_var(), 
                  dataset_name: this.dataset_name(), 
                  y: this.state.y, 
                  mse_y: this.state.mse_y, 
                  x: this.state.x, 
                  mse_x: this.state.mse_x, 
                }, (data) => {
                  this.estimation_ta.append('{0} - Analyzing...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                  this.eval_file('fhme', {}, (data) => {
                    this.estimation_ta.value(data.text);                    
                  });
                });
              }
            }, 
            children: 'Calculate'
          },
        }), 

      ), 

      React.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' }, 
        React.createElement(ARCodeMirror, { title: 'Result', ref: (el) => this.estimation_ta = el })
      )
    );
  }
}




