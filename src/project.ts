import {makeProject} from '@canvas-commons/core';

import title from './scenes/title?scene';
import fan_intro from './scenes/fan-intro?scene';
import fan_demo from './scenes/fan-demo?scene';

export default makeProject({
  scenes: [title, fan_intro, fan_demo]
});