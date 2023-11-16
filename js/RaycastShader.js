class RaycastShader extends Shader{
    constructor(volume){
        super("raycaster_vert", "raycaster_frag");
        // sends color as RGB or BGR in a Vector3 array
        const volumeTexture = new THREE.Data3DTexture(volume.voxels,volume.width, volume.height, volume.depth);
        this.setUniform("volume_dims",
            [
                volumeTexture
            ]);
        // sends whether to use RGB or BGR as index (0: RGB, 1: BGR)
        this.setUniform("colorIdx", 0);

        this.setUniform("volume",
            [
                new THREE.DataTexture3D(volume.voxels,volume.width, volume.height, volume.depth)
            ])

    }
}