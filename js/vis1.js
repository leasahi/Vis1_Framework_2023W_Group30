/**
 * Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Main script for Vis1 exercise. Loads the volume, initializes the scene, and contains the paint function.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */

let renderer, camera, scene, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let volume = null;
let fileInput = null;
let testShader = null;
let dropdown = null;
let mode = 1;
let iso = 0.3;

/**
 * Load all data and initialize UI here.
 */
function init() {

    // volume viewer
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;



    // WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasWidth, canvasHeight);
    container.appendChild(renderer.domElement);

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);

    // mode selection
    dropdown = document.getElementById("mode");
    dropdown.addEventListener('change', changeMode);

    // mode selection
    isoNumberField = document.getElementById("iso");
    isoNumberField.addEventListener('change', changeIso);

    // dummy shader gets a color as input
    testShader = new TestShader([255.0, 255.0, 0.0]);
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile() {
    let reader = new FileReader();
    reader.onloadend = function () {

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        resetVis();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded by the user.
 *
 * Currently renders the bounding box of the volume.
 */
async function resetVis() {
    // create new empty scene and perspective camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);

    this.geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

    const volumeMesh = await volume.getMesh();

    scene.add(volumeMesh);

    // our camera orbits around an object centered at (0,0,0)
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0, 0, 0), 2 * volume.max, renderer.domElement);

    // Density Histogramm:

    // SVG-Container-Größe
    const width = 600;
    const height = 400;

    // Margen
    const margin = {top: 20, right: 20, bottom: 50, left: 40};

    const myNode = document.getElementById("histogram-container");
    if (myNode.childNodes.length!==0){
        myNode.firstChild.remove();
    }

    // SVG-Container erstellen
    const svg = d3
        .select("#histogram-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)


    // Skala für die x-Achse
    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);

    // Skala für die y-Achse
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // Histogramm erstellen
    const histogram = d3
        .histogram()
        .domain(x.domain())
        .thresholds(x.ticks(100)); // Anzahl der Bins

    // Daten hinzufügen:
    nonZero = volume.voxels.filter(value => value !== 0);

    const bins = histogram(nonZero);

    let max = d3.max(bins, (d) => d.length);
    let data = bins.map((bin) => {
        const y = bin.length / max;
        const x0 = bin.x0;
        const x1 = bin.x1;
        return {x0, x1, y};
    });

    // Balken Erstellung
    svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.x0))
        .attr("y", (d) => y(d.y))
        .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", (d) => height - y(d.y))
        .attr("fill", "#444");


    // Achsen hinzufügen
    svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3
                .axisBottom(x)
        )
        .append("text")
        .style("text-anchor", "middle")
        .attr("x", width - margin.right)
        .attr("y", 20)
        .attr("dy", 15) // Abstand unter der X-Achse
        .attr("fill", "white")
        .text("density"); // Beschriftung der X-Achse

    let yAxis = d3.axisLeft(y)
    yAxis.scale(y)

    svg
        .append("g")
        .call(yAxis)
        .append("text")
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top)
        .attr("y", -20)
        .attr("dy", -15) // Abstand links der Y-Achse
        .attr("fill", "white")
        .text("intensity"); // Beschriftung der Y-Achse

    // init paint loop
    requestAnimationFrame(paint);
}

/**
 * Render the scene and update all necessary shader information.
 */
function paint() {
    if (volume) {
        volume.setCameraPosition(camera.position);
        console.log(iso);
        volume.setIso(iso);
        volume.setMethod(mode);
        renderer.render(scene, camera);

    }
}

function changeMode(){
    mode = parseInt(dropdown.value);
    requestAnimationFrame(paint);
}

function changeIso(){
    iso = parseFloat(isoNumberField.value);
    requestAnimationFrame(paint);
}

