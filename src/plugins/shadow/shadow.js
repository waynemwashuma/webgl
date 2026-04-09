/** @import { ViewFiller } from "../../renderer/index.js" */
import { GPUMesh, Shader, WebGLRenderDevice } from "../../core";
import { PrimitiveTopology } from "../../constants/index.js";
import { DirectionalLight, PointLight, SpotLight } from "../../light/index.js";
import { MeshMaterial3D, Object3D } from "../../objects/index.js";
import { FillViewsNode, Plugin, RenderItem, ViewFillers, WebGLRenderer } from "../../renderer/index.js";
import { assert } from "../../utils/index.js";
import { basicVertex } from "../../shader";
import { ShadowMap, ShadowPipelines } from "./resources";
import { ShadowViewNode } from "./nodes";

export class ShadowPlugin extends Plugin {
  /**
   * @override
   * @param {WebGLRenderer} renderer
   */
  init(renderer) {
    const maxShadows = 10
    const viewFillers = renderer.getResource(ViewFillers)

    assert(viewFillers, "ViewFillers resource missing")
    renderer.setResource(new ShadowMap(maxShadows))
    renderer.setResource(new ShadowPipelines())
    renderer.defines.set('MAX_SHADOW_CASTERS', maxShadows.toString())
    viewFillers.set(DirectionalLight.name, fillShadowCameraView)
    viewFillers.set(PointLight.name, fillShadowCameraView)
    viewFillers.set(SpotLight.name, fillShadowCameraView)

    renderer.renderGraph.addNode(ShadowViewNode.name, new ShadowViewNode())
    renderer.renderGraph.addDependency(ShadowViewNode.name, FillViewsNode.name)
    
  }

  /**
   * @override
   */
  preprocess() {}
}

/** @type {ViewFiller} */
function fillShadowCameraView(device, renderer, objects, _plugins, view) {
  const shadowPipelines = renderer.getResource(ShadowPipelines)
  /**@type {RenderItem[]} */
  const opaqueStage = []

  assert(shadowPipelines, "ShadowPipelines resource missing")
  for (let i = 0; i < objects.length; i++) {
    const object = /**@type {Object3D} */ (objects[i])
    object.traverseDFS((child) => {
      if (!(child instanceof MeshMaterial3D)) {
        return true
      }
      const gpuMesh = renderer.caches.getMesh(device, child.mesh, renderer.attributes)
      const item = new RenderItem({
        pipelineId: getRenderPipelineId(device, renderer, gpuMesh, shadowPipelines),
        transform: child.transform.world,
        mesh: gpuMesh,
        uniforms: {},
        tag: ""
      })

      opaqueStage.push(item)
      return true
    })
  }
  view.renderStage.opaque = opaqueStage
}

/**
 * @param {WebGLRenderDevice} device
 * @param {WebGLRenderer} renderer
 * @param {GPUMesh} mesh
 * @param {ShadowPipelines} pipelines
 * @returns {number}
 */
function getRenderPipelineId(device, renderer, mesh, pipelines) {
  const { caches, includes, defines: globalDefines } = renderer
  const pipelineid = pipelines.get(mesh.layoutHash)

  if (pipelineid !== undefined) {
    return pipelineid
  }

  const layout = caches.getMeshVertexLayout(mesh.layoutHash)

  assert(layout, "Invalid mesh layout")
  /**
   * @type {import("src/core").WebGLRenderPipelineDescriptor}
   */
  const descriptor = {
    //cullFace:CullFace.None,
    depthWrite: true,
    topology: PrimitiveTopology.Triangles,
    vertexLayout: layout,
    vertex: new Shader({
      source: basicVertex
    })
  }


  for (const [name, value] of globalDefines) {
    descriptor.vertex.defines.set(name, value)
    descriptor.fragment?.source?.defines?.set(name, value)
  }
  for (const [name, value] of includes) {
    descriptor.vertex.includes.set(name, value)
    descriptor.fragment?.source?.includes?.set(name, value)
  }
  const [_, newId] = caches.createRenderPipeline(device, descriptor)

  pipelines.set(mesh.layoutHash, newId)
  return newId
}