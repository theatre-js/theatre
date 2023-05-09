import React, {useEffect, useRef} from 'react'
import {types} from '@theatre/core'
import type {ISheetObject, IProject} from '@theatre/core'
import {
  Color,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  RawShaderMaterial,
  Scene,
  ShaderMaterial,
  SphereBufferGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

type ThreeSceneProps = {
  project: IProject
}

export default function ThreeScene(props: ThreeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sheet = props.project.sheet('Sphere')

  // Animation
  let sheetObj: ISheetObject | undefined = undefined
  let mesh: Mesh | undefined = undefined

  function animate(key: string, props: any) {
    if (sheetObj === undefined) {
      sheetObj = sheet.object(key, props)
    } else {
      sheetObj = sheet.object(
        key,
        {...props, ...sheetObj.value},
        {reconfigure: true},
      )
    }
    return sheetObj
  }

  function animateMaterial() {
    if (mesh === undefined) return
    const keys = {}
    // Cycle through props
    for (const i in mesh.material) {
      // @ts-ignore
      const value = mesh.material[i]
      if (typeof value === 'number') {
        // @ts-ignore
        keys[i] = value
      } else if (value instanceof Vector2) {
        // @ts-ignore
        keys[i] = {x: value.x, y: value.y}
      } else if (value instanceof Vector3) {
        // @ts-ignore
        keys[i] = {x: value.x, y: value.y, z: value.z}
      } else if (value instanceof Color) {
        // @ts-ignore
        keys[i] = types.rgba({
          r: value.r * 255,
          g: value.g * 255,
          b: value.b * 255,
          a: 1,
        })
      }
    }

    // Uniforms
    if (
      mesh.material instanceof ShaderMaterial ||
      mesh.material instanceof RawShaderMaterial
    ) {
      const uniforms = mesh.material.uniforms
      // @ts-ignore
      keys.uniforms = {}
      for (const i in uniforms) {
        const uniform = uniforms[i].value
        if (typeof uniform === 'number') {
          // @ts-ignore
          keys.uniforms[i] = uniform
        } else if (uniform instanceof Vector2) {
          const value = uniform as Vector2
          // @ts-ignore
          keys.uniforms[i] = {x: value.x, y: value.y}
        } else if (uniform instanceof Vector3) {
          const value = uniform as Vector3
          // @ts-ignore
          keys.uniforms[i] = {x: value.x, y: value.y, z: value.z}
        } else if (uniform instanceof Color) {
          const value = uniform as Color
          // @ts-ignore
          keys.uniforms[i] = {r: value.r, g: value.g, b: value.b}
        }
      }
    }

    // Animate
    animate('Material', {material: keys}).onValuesChange((values: any) => {
      const {material} = values
      for (const key in material) {
        if (key === 'uniforms') {
          const uniforms = material[key]
          for (const uniKey in uniforms) {
            const uniform = uniforms[uniKey]
            if (typeof uniform === 'number') {
              // @ts-ignore
              mesh.material.uniforms[uniKey].value = uniform
            } else {
              // @ts-ignore
              mesh.material.uniforms[uniKey].value.copy(uniform)
            }
          }
        } else {
          const value = material[key]
          if (typeof value === 'number') {
            // @ts-ignore
            mesh.material[key] = value
          } else if (value.r !== undefined) {
            // color
            // @ts-ignore
            mesh.material[key].copy(value)
          } else if (value.x !== undefined) {
            // vector
            // @ts-ignore
            mesh.material[key].copy(value)
          }
        }
      }
    })
  }

  function animateTransform() {
    if (mesh === undefined) return
    animate('Transform', {
      transform: {
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
        },
        rotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        },
        scale: {
          x: mesh.scale.x,
          y: mesh.scale.y,
          z: mesh.scale.z,
        },
        visible: mesh.visible,
      },
    }).onValuesChange((values: any) => {
      if (mesh === undefined) return
      const {transform} = values
      mesh.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z,
      )
      mesh.rotation.set(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
      )
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
      mesh.visible = transform.visible
    })
  }

  useEffect(() => {
    // Basic Three
    let raf = -1
    const width = window.innerWidth
    const height = window.innerHeight
    const renderer = new WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current!,
    })
    renderer.setPixelRatio(devicePixelRatio)
    renderer.setSize(width, height)
    const scene = new Scene()
    const camera = new PerspectiveCamera(60, width / height)
    camera.position.z = 10

    const light = new DirectionalLight()
    light.position.set(1, 5, 4)
    scene.add(light)

    mesh = new Mesh(new SphereBufferGeometry(3), new MeshPhongMaterial())
    scene.add(mesh)

    // RAF
    function render() {
      raf = requestAnimationFrame(render)
      renderer.render(scene, camera)
    }
    render()
    return () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{overflow: 'hidden'}}>
      <canvas ref={canvasRef} />
      <div
        style={{
          position: 'absolute',
          left: '100px',
          top: '0',
        }}
      >
        <button onClick={animateMaterial}>Animate Material</button>
        <button onClick={animateTransform}>Animate Transform</button>
      </div>
    </div>
  )
}
