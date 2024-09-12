import './style.css'
import * as THREE from 'three';
import ThreeInstance, { Screen, ThreeElement } from './threeInstance'
import ImageGrid from './imageGrid'

/* import { initWebglCamera } from './webgl_camera' */

(async function() {
  try {
    const leftBtn = document.getElementById('left-btn')
    const right = document.getElementById('right-btn')
    const images = await loadImages(['pineapple.jpg', 'snow_road.jpg'])
    const position = 'right'

    const elements: Array<ThreeElement> = [
      new ImageGrid({ size: { w: 1280, h: 720 }, position, images }).init()
    ]
    const instance = new ThreeInstance({ 
      screen: new Screen(window.innerWidth, window.innerHeight, position), 
      stats: true,
      elements
    })  


    leftBtn.addEventListener("click", () => instance.toggleMovePosition('left'), false)
    right.addEventListener("click", () => instance.toggleMovePosition('right'), false)
  } catch (e) {
    console.error(e)
  }
})()


async function loadImages(list: Array<string>) {
  const images: Array<HTMLImageElement> = []
  try {
    const loader = new THREE.ImageLoader()
    for (let i = 0; i < list.length; i++) {
      const img = await loader.loadAsync(list[i])
      images.push(img)
    }

    return images
  } catch (e) {
    throw "Couldn't load images"
  }
}