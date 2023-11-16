class raycastShader extends Shader{
    constructor(volume){
        super("raycaster_vert", "raycaster_frag");
        // sends color as RGB or BGR in a Vector3 array
        this.setUniform("volume_dims",
            [
                new  THREE.Vector3(volume.width, volume.height, volume.depth)
            ]);
        // sends whether to use RGB or BGR as index (0: RGB, 1: BGR)
        this.setUniform("colorIdx", 0);
        // sends color as RGB or BGR in a Vector3 array
        // this.setUniform("color",
        //     [
        //         new  THREE.Vector3(color[0], color[1], color[2]),
        //         new THREE.Vector3(color[2], color[1], color[0])
        //     ],
        //     "v3v");

        this.setUniform("volume",
            [
                THREE.DataTexture3D(volume.voxels,volume.width, volume.height, volume.depth)
            ])

    }
}