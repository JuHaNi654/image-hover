import * as THREE from 'three';
import Plane from './plane';
import { ThreeElement } from './threeInstance';
import anime from 'animejs';

type ImageGridOptions = {
  size: { w: number, h: number }
  position?: 'left' | 'right'
  images: Array<HTMLImageElement>
}

export default class ImageGrid implements ThreeElement {
  #mesh = new THREE.Object3D()
  #clock = new THREE.Clock()
  #planes: Array<Plane> = [];
  #opts: ImageGridOptions
  #gap?: number
  #columns?: number
  #rows?: number
  #timer?: number = null
  #delay = 175 // ms
  #delayMultiplier = 2

  rotationYAxis = {
    left: THREE.MathUtils.degToRad(4),
    right: THREE.MathUtils.degToRad(-4),
    current: 0
  }

  constructor(opts: ImageGridOptions, columns?: number, rows?: number, gap?: number) {
    this.#opts = opts
    this.#opts.position = this.#opts.position ?? 'left'
    this.#gap = gap ?? 10
    this.#columns = columns ?? 9
    this.#rows = rows ?? 5
  }

  #generateCanvasTexture = (img: HTMLImageElement, w: number, h: number, offsetY: number, offsetX: number): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = w
    canvas.height = h
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, offsetX, offsetY, w, h, 0, 0, w, h)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.NearestFilter
    return texture
  }

  getMesh = () => {
    return this.#mesh
  }

  render = (scene: THREE.Scene) => {
    scene.add(this.#mesh)
  }

  animate = () => {
    this.#mesh.position.y = 25 * Math.sin(this.#clock.getElapsedTime() * 1);
    this.#mesh.position.x = 25 * Math.cos(this.#clock.getElapsedTime() * 1.25);
  }

  #animatePlanes = () => {
    for (let i = 0; i < this.#planes.length; i++) {
      setTimeout(() => this.#planes[i].animate(), this.#delay * i)
    }

    this.#timer = setTimeout(
      this.#animatePlanes, 
      this.#delay * (this.#planes.length * this.#delayMultiplier)
    )
  }

  rotate = (direction: "left" | "right") => {
    anime({
      targets: this.rotationYAxis,
      current: this.rotationYAxis[direction],
      easing: 'easeInCubic',
      duration: 2000,
      update: () => {
        this.#mesh.rotation.y = (this.rotationYAxis.current)
      }
    })
  }

  init = (): this => {
    const { size, images } = this.#opts

    const initY = 0 + (size.h / 2 + (this.#gap * (this.#rows - 2))) - (this.#gap / 2)
    const initX = 0 - (size.w / 2 + (this.#gap * (this.#columns - 4)))

    const planeW = size.w / this.#columns
    const planeH = size.h / this.#rows

    let delay = 0
    for (let y = 0; y < this.#rows; y++) {
      const posY = initY - (y * (this.#gap + planeH))
      for (let x = 0; x < this.#columns; x++) {
        const posX = initX + (x * (this.#gap + planeW))
        const frontTexture = this.#generateCanvasTexture(images[0], planeW, planeH, (y * planeH), (x * planeW))
        const backTexture = this.#generateCanvasTexture(images[1], planeW, planeH, (y * planeH), (x * planeW))
        const plane = new Plane({
          size: { w: planeW, h: planeH },
          position: { x: posX, y: posY },
          delay: delay,
          textures: {
            front: frontTexture,
            back: backTexture
          }
        })

        delay += 50
        this.#planes.push(plane)
        this.#mesh.add(plane.getMesh())
      }
    }

    this.rotationYAxis.current = this.rotationYAxis[this.#opts.position]
    this.#mesh.rotateY(this.rotationYAxis.current)
    this.#animatePlanes()
    return this
  }
}