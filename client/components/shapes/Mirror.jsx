import { quasiPeriodBehaviour } from "../../functions/getPeriodic.js";
import smart from "../../functions/smart.js";
import getChildrenPaths from "../../functions/getChildrenPaths.js";
import getChildrenBBox from "../../functions/getChildrenBBox.js";
import Transform from "../tools/Transform.jsx";

const Mirror = ({ children, axis = "y", spacing = 2000, iterations = 4, alternate = true, ...restProps }) => {


let previousLevel = children;
const mirror = [previousLevel];

for (let i = 1; i < iterations; i++) {

    //on every other iteration we will calucate dimensions of previous level and therefore how much its flipped copy has to be moved would be cool to that automatically without calculating size
    const levelPaths = getChildrenPaths(previousLevel);
    const levelBBox = getChildrenBBox(levelPaths);

    const x = axis === "x" ? levelBBox.width + spacing : 0;
    const y = axis === "y" ? levelBBox.height + spacing : 0;
    
    //determine flip axis 
    if (alternate) {
        if (i % 2 === 0) {
            axis = "x"
        } else {
            axis = "y"
        }
    }
    
    //determine where to flip the child
    const flipX = axis === "x" 
    const flipY = axis === "y"

    //we create the new level and push it to the result
    let newLevel = <Transform x={x} y={y}  flipX={flipX || quasiPeriodBehaviour(i-1)} flipY={flipY}>{levelPaths}</Transform>
    mirror.push(newLevel)
    //we set the previous level equal to the new one
    previousLevel = [previousLevel, newLevel]
  }

    return smart(mirror, restProps);
};
  export default Mirror