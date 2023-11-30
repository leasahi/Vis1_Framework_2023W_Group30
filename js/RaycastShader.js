class RaycastShader extends Shader {
    constructor(volume){
        super("raycaster_vert", "raycaster_frag");
        // sends color as RGB or BGR in a Vector3 array
        const volumeTexture = new THREE.Data3DTexture(volume.voxels, volume.width, volume.height, volume.depth);
        volumeTexture.format = THREE.RedFormat
        volumeTexture.type = THREE.FloatType
        volumeTexture.minFilter = volumeTexture.magFilter = THREE.LinearFilter
        volumeTexture.unpackAlignment = 1
        volumeTexture.needsUpdate = true


        this.setUniform("volume", volumeTexture)

    }
}