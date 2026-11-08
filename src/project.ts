import {makeProject} from '@canvas-commons/core';

import title from './scenes/title?scene';
import method1 from './scenes/method1?scene';
import demo1 from './scenes/demo1?scene';

export default makeProject({
  scenes: [title, method1, demo1]
});