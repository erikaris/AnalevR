# react-bootstrap-select

This is a small React wrapper around bootstrap-select jQuery plugin.

Read [package.json]() for a reference on current peer dependencies.
You'll need them in your project for this component to work properly and look properly.

## installation

`yarn add @highpoint/react-bootstrap-select`

## usage

```javascript
import Select from 'react-bootstrap-select';
import { render } from 'react-dom';
import 'bootstrap-select';

const Element = <Select
  bs={{
    // use bs prop to pass options to the bootstrap-select plugin
    mobile: true
  }}
  bs-events={{
    onChanged: ev => console.log('changed!', ev.target.value)
  }}
  container={{
    // pass props for the container
    className: 'bootstrap-select-container'
  }}
  // rest of the props go to the select
  name='my-select'
  multiple
>
  <option value={1}>1 Minute</option>
  <option value={2}>2 Minutes</option>
</Select>;

render(<Element />, document.querySelector('.app-container'));
```

Refer to [experiment]() for a full example of this component working.
You can run it with `npm run experiment`.

## events

Pass any of the following events to the `bs-events` prop:

* `onShow`
* `onShown`
* `onHide`
* `onHidden`
* `onLoaded`
* `onRendered`
* `onRefreshed`
* `onChanged`

Documentation [here](https://silviomoreto.github.io/bootstrap-select/options/#events)
