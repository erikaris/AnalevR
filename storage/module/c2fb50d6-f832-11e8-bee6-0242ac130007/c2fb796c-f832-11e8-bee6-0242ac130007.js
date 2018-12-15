// ui.js

window.FirstModule = class extends BaseModule {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return React.createElement('div', { className: 'row', ref: (el) => this.row = el })
    }
}


