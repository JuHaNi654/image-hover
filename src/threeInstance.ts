import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import ImageGrid from './imageGrid';
import anime from 'animejs';

export interface ThreeElement {
  render: (scene: THREE.Scene) => void
  getMesh: () => THREE.Object3D | THREE.Mesh
  animate: () => void
}

type ThreeInstanceOptions = {
  screen: Screen
  stats?: boolean
  elements: Array<ThreeElement>
}

type ScreenPosition = 'left' | 'right'

export default class ThreeInstance {
  #camera: THREE.PerspectiveCamera
  #scene: THREE.Scene
  #renderer: THREE.WebGLRenderer
  #elements: Array<ThreeElement>
  #opts: ThreeInstanceOptions
  #stats = new Stats()
  

  /* Camera moving properties */
  cameraXAxisMovement = {
    current: 0,
    target: 0
  }

  constructor(opts: ThreeInstanceOptions) {
    this.#opts = opts
    this.#camera = this.#newPerspectiveCamera(opts.screen)
    this.#scene = this.#newScene()
    this.#renderer = this.#newRenderer()
    this.#elements = opts.elements

    if (typeof this.#opts.stats !== "boolean") {
      this.#opts.stats = false
    }

    if (this.#opts.stats) {
      document.body.appendChild(this.#stats.dom)
    }

    for (let i = 0; i < opts.elements.length; i++) {
      opts.elements[i].render(this.#scene)
    }

    this.#renderer.setAnimationLoop(this.#render)
    window.addEventListener('resize', this.#onResize);
  }

  toggleMovePosition = (direction: ScreenPosition) => {
    if (direction === this.#opts.screen.position) return;

    this.cameraXAxisMovement.current = this.#opts.screen.currentOffset()
    this.cameraXAxisMovement.target = this.#opts.screen.updateOffset(direction)

    for (let i = 0; i < this.#elements.length; i++) {
      if (this.#elements[i] instanceof ImageGrid) {
        const grid = this.#elements[i] as ImageGrid
        grid.rotate(direction)
      }
    }

    this.#moveCamera()
  }


  #moveCamera = () => {
    anime({
      targets: this.cameraXAxisMovement,
      current: this.cameraXAxisMovement.target,
      easing: 'easeInOutBack',
      duration: 3000,
      round: 1,
      update: () => {
        this.#camera.setViewOffset(
          this.#opts.screen.w,
          this.#opts.screen.h,
          this.cameraXAxisMovement.current, 0,
          this.#opts.screen.w,
          this.#opts.screen.h
        )
      }
    })
  }

  #onResize = () => {
    this.#opts.screen = this.#opts.screen.update(window.innerWidth, window.innerHeight)
    this.#renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.#camera instanceof THREE.PerspectiveCamera) {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
    }

    this.#camera.updateProjectionMatrix();
    this.#render();
  }
  
  /* Camera */
  #newPerspectiveCamera = (screen: Screen): THREE.PerspectiveCamera => {
    const posX = 0
    const camera = new THREE.PerspectiveCamera(90, screen.aspect(), 1, 2000);
    camera.position.set(posX, 0, 900);
    camera.setViewOffset(screen.w, screen.h, (posX + screen.currentOffset()), 0, screen.w, screen.h)
    camera.lookAt(0, 0, 0);

    return camera
  }

  /* Scene */
  #newScene = (): THREE.Scene => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    return scene
  }

  /* Renderer */
  #newRenderer = (): THREE.WebGLRenderer => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.toneMapping = THREE.NoToneMapping
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return renderer
  }

  /* Render/Animation loop */
  #render = () => {
    for (let i = 0; i < this.#elements.length; i++) {
      this.#elements[i].animate()
    }

    if (this.#opts.stats) {
      this.#stats.update()
    }

    this.#renderer.render(this.#scene, this.#camera);
  }

  scene = (): THREE.Scene => {
    return this.#scene
  }
}

export class Screen {
  w: number
  h: number
  position: ScreenPosition

  constructor(w: number, h: number, position?: ScreenPosition) {
    this.w = w
    this.h = h
    this.position = position || 'left'
  }

  aspect = (): number => {
    return this.w / this.h
  }

  update = (w: number, h: number): this => {
    this.w = w
    this.h = h
    return this
  }

  currentOffset = (): number => {
    if (this.position === 'left') {
      return this.w / 4
    } else if (this.position === 'right') {
      return -(this.w / 4)
    }

    return 0
  }


  updateOffset = (position: ScreenPosition): number => {
    this.position = position
    if (position === 'left') {
      return this.w / 4
    } else if (position === 'right') {
      return -(this.w / 4)
    }

    return 0
  }
}
