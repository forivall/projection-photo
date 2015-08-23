// import fs from 'fs';
import React from 'react';
import ImageFolder from './ImageFolder';
import ScreenSelector from './ScreenSelector';
import ipc from 'ipc';

function startPresentation() {
  ipc.send('start-presentation');
}
function displaySelected(display) {
  ipc.send('display-selected', {display});
}
React.render(
  <div>
    <button onClick={startPresentation}>Start</button>
    <ScreenSelector onDisplaySelected={displaySelected}/>
    <ImageFolder/>
  </div>, document.body);
