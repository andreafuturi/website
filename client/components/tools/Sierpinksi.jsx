import Transform from './Transform.jsx'
import {quasiPeriodBehaviour} from '../../functions/getPeriodic.js'
import getSize from '../../functions/getSize.js'

function Sierpinski({iterations = 7 , vSpacing=1,hSpacing=1,...props}, children) { //flipX and flipY?
  const childSize = getSize(() => children) //bisogna capire se ha senso usare il figlio o bisogna usare atom in generale

  const leftVert = [-childSize.width, 0]
  const rightVert = [childSize.width, 0]
  const middleTopVert = [0, childSize.height]
 
  const sizing = 0.5 //how fast element will decrease/ increase
  const levels = [children]
  for (let i = 1; i < iterations; i++) {
    const leftVertTop = [-childSize.width*hSpacing, childSize.height*vSpacing/i]
    const rightVertTop = [childSize.width*hSpacing, childSize.height*vSpacing/i]
    const verts = [rightVertTop,leftVertTop] //rightvertTop leftVertTop primaide micc

    const mirrorHor = quasiPeriodBehaviour(i)
    levels[i] = verts.map(vert => 
        Transform({size:sizing, x:vert[0], y:vert[1], group: true, fromcenter:true}, //placing an Atom for eact verts
          levels[i-1]
        )
    )
  }
  return levels
}

export default Sierpinski