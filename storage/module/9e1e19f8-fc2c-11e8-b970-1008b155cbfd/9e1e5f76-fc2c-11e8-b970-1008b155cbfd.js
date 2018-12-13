// ui.js

window.knn = class extends AR.BaseModule {
  constructor(props) {
    super(props);

    this.state = _.extend(this.state, {
      dataset_changing: false,

      knn_class_variables: [], 
      knn_class_changing: false, 
      knn_class: null, 

      knn_variables_variables: [], 
      knn_variables_changing: false, 
      knn_variables: [], 

      knn_per_changing: false, 
      knn_per: 80, 

      knn_k_changing: false, 
      knn_k: 3, 

      knn_distance_options: [
        {value: 'euclidean', label: 'Euclidean', selected: true}, 
        {value: 'manhattan', label: 'Manhattan'}, 
        {value: 'minkowski', label: 'Minkowski'}, 
        {value: 'mamming', label: 'Hamming'}
      ], 
      knn_distance_changing: false, 
      knn_distance: 'euclidean',
      
      knn_power_mink_changing: false,
      knn_power_mink: 2, 
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dataset_changing) {
      this.setState({
        knn_class_variables: this.dataset().variables, 
        dataset_changing: false,
      });
    }

    if (this.state.knn_class_changing) {
      this.setState({
        knn_variables_variables: this.dataset().variables.filter((v) => v != this.state.knn_class), 
        knn_class_changing: false,
      });
    }

    if (this.state.knn_variables_changing) {

    }

    if (this.state.knn_per_changing) {
      this.setState({
        knn_per_changing: false,
      });
    }

    if (this.state.knn_k_changing) {
      this.setState({
        knn_k_changing: false,
      });
    }

    if (this.state.knn_distance_changing) {
      this.setState({
        knn_distance_changing: false,
      });
    }

    if (this.state.knn_power_mink_changing) {
      this.setState({
        knn_power_mink_changing: false,
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
              options: Object.values(this.datasets()).map((d) => { return {value: d.id, label: d.label} }), 
              width: 'auto', 
              'bs-events': {
                onLoaded: (ev) => {
                  this.setState({
                    dataset_id: ev.target.value, 
                    dataset_changing: true,
                  });
                }, 
                onChanged: (ev) => {
                  this.setState({
                    dataset_id: ev.target.value, 
                    dataset_changing: true,
                  });
                }
              }
            }
          },
        }), 

        !this.state.dataset_changing && this.state.knn_class_variables.length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Class', 
            help: 'Select class variable', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: false, 
                options: this.state.knn_class_variables.map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState({
                      knn_class: ev.target.value, 
                      knn_class_changing: true, 
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState({
                      knn_class: ev.target.value,  
                      knn_class_changing: true, 
                    });
                  }
                }
              }
            },
          }) : null,
        
        !this.state.knn_class_changing && this.state.knn_variables_variables.length > 0 ? 
          React.createElement(AR.FormGroup, {
            title: 'Variables', 
            help: 'Select variable(s)', 
            type: {
              class: ReactBootstrap.SelectPicker, 
              props: {
                multiple: true, 
                options: this.state.knn_variables_variables.map(v => { return {value: v, label: v} }), 
                width: 'auto', 
                'bs-events': {
                  onLoaded: (ev) => {
                    this.setState({
                      // knn_variables: ev.target.value, 
                      knn_variables_changing: true, 
                    });
                  }, 
                  onChanged: (ev) => {
                    this.setState({
                      // knn_variables: ev.target.value,  
                      knn_variables_changing: true, 
                    });
                  }
                }
              }
            },
          }) : null, 

        React.createElement(AR.FormGroup, {
          title: 'Split Data', 
          help: 'Slide to set split data', 
          type: {
            class: ReactBootstrap.Slider, 
            props: {
              min: 0, 
              max: 100, 
              value: this.state.knn_per, 
              onChange: (value) => this.setState({
                knn_per: value, 
                knn_per_changing: true, 
              }), 
              style: {
                width: '100%'
              }
            }
          },
        }), 

        React.createElement(AR.FormGroup, {
          title: 'Number of K', 
          help: 'Enter number of K', 
          type: {
            class: ReactBootstrap.FormControl, 
            props: {
              type: 'text', 
              value: this.state.knn_k, 
              placeholder: 'Enter number of K', 
              onChange: (e) => this.setState({
                knn_k: e.target.value, 
                knn_k_changing: true, 
              }), 
              style: {
                width: '100%'
              }
            }
          },
        }), 

        React.createElement(AR.FormGroup, {
          title: 'Distance', 
          help: 'Select distance method', 
          type: {
            class: ReactBootstrap.SelectPicker, 
            props: {
              multiple: false, 
              options: this.state.knn_distance_options, 
              width: 'auto', 
              'bs-events': {
                onLoaded: (ev) => {
                  this.setState({
                    knn_distance: ev.target.value, 
                    knn_distance_changing: true,
                  });
                }, 
                onChanged: (ev) => {
                  this.setState({
                    knn_distance: ev.target.value, 
                    knn_distance_changing: true,
                  });
                }
              }
            }
          },
        }), 

        !this.state.knn_distance_changing && this.state.knn_distance == 'minkowski' ? 
          React.createElement(AR.FormGroup, {
            title: 'Power minkowski', 
            help: 'Enter the power of minkowski', 
            type: {
              class: ReactBootstrap.FormControl, 
              props: {
                type: 'text', 
                value: this.state.knn_power_mink, 
                placeholder: 'Enter the power of minkowski', 
                onChange: (e) => this.setState({
                  knn_power_mink: e.target.value, 
                  knn_power_mink_changing: true, 
                }), 
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
                this.result_ta.value('{0} - Initializing ...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                this.eval_file('init', {
                  dataset: this.dataset_var(), 
                  dataset_name: this.dataset_name(), 
                  per: this.state.knn_per, 
                  knn_class: this.state.knn_class, 
                  distance: this.state.knn_distance, 
                  power_mink: this.state.knn_power_mink, 
                  k: this.state.knn_k, 
                }, (data) => {

                  this.result_ta.append('{0} - Splitting dataset into train and test...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                  this.eval_file('split', {}, (data) => {

                    this.result_ta.append('{0} - Calculating kNN...'.format(moment().format("YYYY-MM-DD hh:mm:ss")));
                    this.eval_file('knn', {}, (data) => {

                      this.result_ta.value(data);
                      
                    });
                    
                  });

                });
              }
            }, 
            children: 'Process'
          },
        }), 

      ), 
      React.createElement('div', { className: 'col-lg-8 col-md-8 col-sm-12 col-xs-12' }, 
        React.createElement(ARCodeMirror, { title: 'Result', ref: (el) => this.result_ta = el })
      )
    )
  }
}




