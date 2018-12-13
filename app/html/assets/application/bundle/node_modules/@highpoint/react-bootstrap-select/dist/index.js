'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('bootstrap-select');

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = ['show', 'shown', 'hide', 'hidden', 'loaded', 'rendered', 'refreshed', 'changed'];

var capitalizeFirstLetter = function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

var prefixEvent = function prefixEvent(event) {
  return 'on' + capitalizeFirstLetter(event);
};

var cleanupSelectProps = function cleanupSelectProps(obj) {
  var newObj = _extends({}, obj);
  delete newObj.bs;
  delete newObj.container;
  delete newObj['bs-events'];
  return newObj;
};

var guid = function guid() {
  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

var ReactBS = function (_React$Component) {
  _inherits(ReactBS, _React$Component);

  function ReactBS(props, context) {
    _classCallCheck(this, ReactBS);

    var _this = _possibleConstructorReturn(this, (ReactBS.__proto__ || Object.getPrototypeOf(ReactBS)).call(this, props, context));

    var id = props.id || guid();
    _this.state = { id: id, open: false };
    _this.onHTMLClick = _this.onHTMLClick.bind(_this);
    return _this;
  }

  _createClass(ReactBS, [{
    key: 'onHTMLClick',
    value: function onHTMLClick() {
      if (this.state.open) this.setState({ open: false });
    }
  }, {
    key: 'handleBsEvents',
    value: function handleBsEvents() {
      var _this2 = this;

      var eventsProp = this.props['bs-events'];
      if (eventsProp === undefined) return;
      events.forEach(function (event) {
        var fn = eventsProp[prefixEvent(event)];
        if (fn === undefined) return;
        _this2.$select.on(event + '.bs.select', function () {
          return fn.apply(undefined, arguments);
        });
      });
    }
  }, {
    key: 'cancelBsEvents',
    value: function cancelBsEvents() {
      var _this3 = this;

      var eventsProp = this.props['bs-events'];
      if (eventsProp === undefined) return;
      events.forEach(function (event) {
        var fn = eventsProp[prefixEvent(event)];
        if (fn === undefined) return;
        _this3.$select.off(event + '.bs.select', fn);
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.$select.selectpicker('refresh');
      this.$menu.toggleClass('open', this.state.open);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.cancelBsEvents();
      (0, _jquery2.default)(document).off('click.rbs-' + this.state.id).off('keyup.rbs-' + this.state.id);
      this.$root.find('button').off('click');
      this.$container.off('click');
      this.$select.selectpicker('destroy');
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var open = !this.state.open;
      this.setState({ open: open });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this4 = this;

      this.$container = this.props.bs.container ? (0, _jquery2.default)(this.props.bs.container) : this.$root;
      this.$select.selectpicker(this.props.bs);
      this.$menu = this.props.bs.container ? this.$select.data('selectpicker').$bsContainer : this.$container.find('> .bootstrap-select');
      this.handleBsEvents();

      (0, _jquery2.default)(document).on('click.rbs-' + this.state.id, this.onHTMLClick).on('keyup.rbs-' + this.state.id, function (e) {
        if (e.key === 'Escape') _this4.onHTMLClick();
      });

      this.$root.find('button').on('click', function (e) {
        e.stopPropagation();
        if (_this4.$select.is(':disabled')) return;
        _this4.toggle();
      });

      var itemSelector = '> .bootstrap-select > .dropdown-menu > ul > li > a';

      this.$container.on('click', itemSelector, function () {
        if (_this4.props.multiple) return;
        _this4.toggle();
      }).on('keyup', itemSelector, function (e) {
        if (e.key === ' ' || e.key === 'Enter') (0, _jquery2.default)(e.target).click();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      return _react2.default.createElement(
        'div',
        _extends({
          ref: function ref(container) {
            _this5.$root = (0, _jquery2.default)(container);
          }
        }, this.props.container),
        _react2.default.createElement('select', _extends({
          ref: function ref(select) {
            _this5.$select = (0, _jquery2.default)(select);
          }
        }, cleanupSelectProps(this.props)))
      );
    }
  }]);

  return ReactBS;
}(_react2.default.Component);

ReactBS.defaultProps = {
  bs: {}
};

ReactBS.propTypes = {
  bs: _propTypes2.default.object,
  'bs-events': _propTypes2.default.objectOf(_propTypes2.default.func),
  container: _propTypes2.default.object,
  id: _propTypes2.default.string,
  multiple: _propTypes2.default.bool
};

exports.default = ReactBS;
