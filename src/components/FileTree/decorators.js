import { decorators as defaultDecorators } from 'react-treebeard';
import styled from '@emotion/styled';

const Polygon = styled('polygon', {
  shouldForwardProp: prop => ['className', 'children', 'points'].indexOf(prop) !== -1
})((({style}) => style));

export default Object.assign(
  defaultDecorators, 
  {
    Toggle: ({style}) => {
      const { height: h } = style;
      const l = 0.7071 * h; //  Math.pow(2, 0.5) / 2 * h
      const p = (h - l) * 0.5;
      const points = `${p},${p} ${p+l/2},${h/2} ${p},${p+l}`;
      const s = Object.assign({}, style.base, {transformOrigin: '10% 60%'})
      return (
          <div style={s}>
              <svg height={h} width={h} style={{marginTop: 5}}>
                <Polygon 
                  points={points}
                  style={style.arrow}
                />
              </svg>
          </div>
      );
    }
  }
);
