class TriangleP{
    constructor(){
        this.type='triangleP';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
    
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //pass the matrix to u_modelmatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        drawTriangle3d([0.0, 0.0, 0.0, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0]);
        drawTriangle3d([0.0, 0.0, 0.0, 0.5, 1.0, 0.0, 0.5, 1.0, 1.0]);
        drawTriangle3d([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.5, 1.0, 1.0]);
        drawTriangle3d([1.0, 0.0, 0.0, 0.5, 1.0, 1.0, 0.5, 1.0, 0.0]);
        drawTriangle3d([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.5, 1.0, 1.0]);
        drawTriangle3d([0.0, 0.0, 1.0, 0.5, 1.0, 1.0, 1.0, 0.0, 1.0]);
        drawTriangle3d([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);
        drawTriangle3d([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);


        // gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        // drawTriangle3d( [0, 1, 0, 0, 1, 1, 1, 1, 1]);//top side
        // drawTriangle3d( [0, 1, 0, 1, 1, 1, 1, 1, 0]);

        // drawTriangle3d( [0, 0, 0, 0, 1, 0, 0, 1, 1]);
        // drawTriangle3d( [0, 0, 0, 0, 1, 1, 0, 0, 1]); //left side

        // // drawTriangle3d( [1, 0, 1, 1, 1, 1, 1, 0, 1]); //what face is this?
        // // drawTriangle3d( [1, 0, 1, 1, 1, 0, 1, 1, 0]);

        // drawTriangle3d( [0, 0, 0, 1, 0, 0, 1, 0, 1]); //bottom face
        // drawTriangle3d( [0, 0, 0, 1, 0, 1, 0, 0, 1]);

        // drawTriangle3d( [1, 0, 0, 1, 1, 0, 1, 1, 1]);
        // drawTriangle3d( [1, 0, 0, 1, 1, 1, 1, 0, 1]);//right side 

        // gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
        // drawTriangle3d( [0, 0, 1, 1, 0, 1, 1, 1, 1]);
        // drawTriangle3d( [0, 0, 1, 1, 1, 1, 0, 1, 1]);//backside
    }
}
