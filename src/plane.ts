import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type PlaneOptions = {
  size: { w: number, h: number }
  position: { x: number, y: number }
  delay: number 
  textures: { front: THREE.CanvasTexture, back: THREE.CanvasTexture }
}

export default class Plane {
  #mesh: THREE.Mesh
  #speed = 1.5
  #degrees = 180
  #current = 0

  constructor(opts: PlaneOptions) {
    const geometry = new THREE.PlaneGeometry(opts.size.w, opts.size.h);

    const frontMaterial = new THREE.MeshBasicMaterial({ 
      map: opts.textures.front 
    });
    const backMaterial = new THREE.MeshBasicMaterial({
      map: opts.textures.back
    });

    this.#mesh = new THREE.Mesh(mergeGeometries([
      geometry,
      geometry.clone().rotateY(Math.PI)
    ], true), [
      frontMaterial,
      backMaterial
    ])

    const posX = opts.position.x + (opts.size.w / 2)
    const posY = opts.position.y - (opts.size.h / 2) 

    this.#mesh.position.set(posX, posY, 0)
  }

  getMesh = (): THREE.Mesh => {
    return this.#mesh
  }

  animate = () => {
    this.#mesh.rotateY(THREE.MathUtils.degToRad(this.#speed))
    this.#current += this.#speed
    if (this.#current < this.#degrees) {
      requestAnimationFrame(this.animate)
    } else {
      this.#mesh.rotation.y = Math.PI * 2
      this.#current = 0
    }
  }
}