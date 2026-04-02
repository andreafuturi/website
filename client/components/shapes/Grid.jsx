import { getLogoRatio, quasiPeriodBehaviour } from '../../functions/getPeriodic.js'
import getChildrenPaths from '../../functions/getChildrenPaths.js'
import getChildrenBBox from '../../functions/getChildrenBBox.js'
import smart from '../../functions/smart.js'
import Transform from '../tools/Transform.jsx'

const Grid = ({ scaledPattern,width, height, spacing = 0, vSpacing = spacing, hSpacing = spacing, children, onlyLogo, halfWidth = true, evenOddVerticalFlip = true ,evenOddHorizontalFlip, ...restProps}) => {
  const childrenPaths = getChildrenPaths(children)
  const childrenBBox = getChildrenBBox(childrenPaths)
  if (onlyLogo) {
    height = 5 
    width = 9 
    halfWidth = true
    vSpacing = getLogoRatio(spacing) * 2
  }
      const logoPositions = [4, 12, 13, 14, 20, 21, 23, 24, 28, 29, 30, 33, 34, 36, 37, 39, 40, 43, 44];
      const positions = onlyLogo ? logoPositions : Array.from({ length: width * height }, (_, i) => i);

      const grid = positions.map(i => {
          return (<Transform
          merged={false}
          scale={scaledPattern ? quasiPeriodBehaviour(i) ? 0.5 : 1 : undefined}
                  x={(i % width) * (hSpacing + childrenBBox.width) - (halfWidth ? childrenBBox.width / 2 * (i % width) : 0)}
                  y={Math.floor(i / width) * (vSpacing + childrenBBox.height)}
                  flipX={quasiPeriodBehaviour(i)}
                  //flipX={(i % width + Math.floor(i / width)) % 2 === 1 && evenOddHorizontalFlip}
                  flipY={(i % width + Math.floor(i / width)) % 2 === 1 && evenOddVerticalFlip}
                  //optimize
              >
                  {childrenPaths}
              </Transform>
          );
      });
  return smart(grid, restProps)
}

export default Grid