function getAutoBBox() {
  const svg = document.querySelector('svg')
  function updateBox() {
    //const size = svg.getBBox()
   // svg.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`)
  }
  updateBox()
  svg.addEventListener('DOMSubtreeModified', function(e) {
    updateBox()
  })
  document.addEventListener('keydown',function(event) {
    if (event.metaKey) {
      if (event.key === 's') {
        event.preventDefault()
        svg.removeAttribute('style')
        svg.removeAttribute('onload')
        let blob = new Blob([svg.outerHTML], {type : 'image/svg+xml'})
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = URL.createObjectURL(blob)
        link.download = 'pattern.svg'
        document.body.appendChild(link)
        link.click()
        return false
      }
    }
    return true
  })
}
export default getAutoBBox

  // svg.addEventListener('mousedown', startDrag)
  // svg.addEventListener('mousemove', drag)
  // svg.addEventListener('mouseup', endDrag)
  // svg.addEventListener('mouseleave', endDrag)
  // svg.addEventListener('touchstart', startDrag)
  // svg.addEventListener('touchmove', drag)
  // svg.addEventListener('touchend', endDrag)
  // svg.addEventListener('touchleave', endDrag)
  // svg.addEventListener('touchcancel', endDrag)
  // function getMousePosition(evt) {
  //     const CTM = svg.getScreenCTM()
  //     if (evt.touches) { evt = evt.touches[0] }
  //     return {
  //         x: (evt.clientX - CTM.e) / CTM.a,
  //         y: (evt.clientY - CTM.f) / CTM.d
  //     }
  // }
  // let selectedElement, offset, transform
  // function startDrag(evt) {
  //         selectedElement = evt.target
  //         offset = getMousePosition(evt)

  //         // Make sure the first transform on the element is a translate transform
  //         const transforms = selectedElement.transform.baseVal

  //         if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
  //             // Create an transform that translates by (0, 0)
  //             const translate = svg.createSVGTransform()
  //             translate.setTranslate(0, 0)
  //             selectedElement.transform.baseVal.insertItemBefore(translate, 0)
  //         }

  //         // Get initial translation
  //         transform = transforms.getItem(0)
  //         offset.x -= transform.matrix.e
  //         offset.y -= transform.matrix.f
  // }
  // function drag(evt) {
  //     if (selectedElement) {
  //         evt.preventDefault()
  //         const coord = getMousePosition(evt)
  //         transform.setTranslate(coord.x - offset.x, coord.y - offset.y)
  //     }
  // }

  // function endDrag(evt) {
  //     selectedElement = false
  // }