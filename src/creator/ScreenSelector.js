import atomScreen from 'screen';

import React from 'react';
import {sortBy, find} from 'lodash';

function serializeDisplay(display) {
  return {
    bounds: {
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height
    },
    id: display.id,
    // rotation: display.rotation,
    // scaleFactor: display.scaleFactor,
    // size: display.size,
    // workArea: display.workArea,
    // workAreaSize: display.workAreaSize,
  };
}

function pythagDistance(x, y) {
  return Math.sqrt(x*x + y*y);
}

export default class ScreenSelector extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {displays: sortBy(atomScreen.getAllDisplays().map(serializeDisplay), display => pythagDistance(display.bounds.x, display.bounds.y))};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onDisplaySelected(find(this.state.displays, (display) => (''+display.id) === (''+event.target.value)));
  }

  render() {
    return <div>{this.state.displays.map((display) => {
      let bounds = display.bounds;
      return [
        (<input type="radio" name="screen" value={display.id} id={"display" + display.id} onChange={this.handleChange}></input>),
        (<label htmlFor={"display" + display.id}>{bounds.width}x{bounds.height}&nbsp;+{bounds.x}+{bounds.y}</label>)
      ];
    })}</div>;
  }
}
