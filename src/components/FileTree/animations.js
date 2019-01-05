import { animations as defaultAnimations } from 'react-treebeard';

export default Object.assign(defaultAnimations, {
  toggle: ({node: {toggled}}) => ({
    animation: toggled ? {rotateZ: '45deg'} : { rotateZ: 0}, 
    duration: 0
  }),
});

