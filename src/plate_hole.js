import 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkPolyDataReader from 'vtk.js/Sources/IO/Legacy/PolyDataReader';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import vtkXMLImageDataReader from 'vtk.js/Sources/IO/XML/XMLImageDataReader';
//import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';

import controlPanel from './controlPanel_1.html';

//const fileName = 'all_fibers.vtk'; // 'uh60.vtk'; // 'luggaBody.vtk';
const imgFileName = 'plate_hole.vti';
const numFiles = 4;
const fileNames = ['plate_hole_matrix.vtp']; // vtk would not open!
for (let i = 1; i < numFiles; i++)
{
    fileNames.push('plate_hole_fibers_' + i.toString() + '.vtk');
    //console.log(fileNames[i]);
}

// 
// Standard rendering code setup
// 
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

renderer.setUseDepthPeeling(true); // For translucency

const bgColor = [1, 1, 1];
fullScreenRenderer.setBackground(bgColor);

const resetCamera = renderer.resetCamera;
const render = renderWindow.render;

//
// Read the input files
//
//const polydatas = [];
var pdActors = new Array(numFiles + 1);
//HACK - vtk for some reason is not working
const reader = vtkXMLPolyDataReader.newInstance();
reader.setUrl(`./${fileNames[0]}`).then(() => 
{
    const polydata = reader.getOutputData(0);
    const mapper = vtkMapper.newInstance();
    const actor = vtkActor.newInstance();

    actor.setMapper(mapper);
    mapper.setInputData(polydata);

    renderer.addActor(actor);
    //polydatas.push(polydata);
    //pdActors.push(actor);
    pdActors[0] = actor;
    actor.getProperty().setOpacity(0.2);
    actor.getProperty().setColor(.4, .4, .4);
    //console.log(actor.getBounds())
    resetCamera(); // Has to be called for each file!
    render();
});
//HACK
//for (let fileName of fileNames)
for (let i = 1; i < numFiles; i++)
{
    const reader = vtkPolyDataReader.newInstance();
    reader.setUrl(`./${fileNames[i]}`).then(() => 
    {
        const polydata = reader.getOutputData(0);
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();

        actor.setMapper(mapper);
        mapper.setInputData(polydata);

        renderer.addActor(actor);
        //polydatas.push(polydata);
        //pdActors.push(actor);
        pdActors[i] = actor;
        actor.getProperty().setColor(.6, .1, .2);
        if (i == 1)
            actor.getProperty().setColor(.2, .2, 1.);
        if (i == 2)
            actor.getProperty().setColor(.1, .1, .1);
        //console.log(actor.getBounds())
        resetCamera(); // Has to be called for each file!
        render();
    });
}
// Reading image data
//const fileReader = new FileReader();
//fileReader.readAsArrayBuffer(`./${imgFileName}`);
const imgReader = vtkXMLImageDataReader.newInstance();
imgReader.setUrl(`./${imgFileName}`).then(() => 
{
    //imgReader.parseAsArrayBuffer(fileReader.result);
    const imgdata = imgReader.getOutputData(0);
    const bnds = imgdata.getBounds();
    imgdata.setOrigin(-0.5*(bnds[1]+bnds[0]), -0.5*(bnds[3]+bnds[2]), -0.06); //z val hardcoded
    const mapper = vtkVolumeMapper.newInstance();
    const actor = vtkVolume.newInstance();

    actor.setMapper(mapper);
    mapper.setInputData(imgdata);
    renderer.addVolume(actor);

    // Set sample distance
    const sampDist = 0.7*Math.sqrt(imgdata.getSpacing().
                                    map((v)=>v*v).reduce((a,b) => a + b, 0));
    console.log(sampDist);
    mapper.setSampleDistance(sampDist);
    mapper.setMaximumSamplesPerRay(2500);

    const ctFunc = vtkColorTransferFunction.newInstance();
    ctFunc.addRGBPoint(0, 1, 1, 1);
    ctFunc.addRGBPoint(1, 0.4, 0.4, 0.4);
    ctFunc.addRGBPoint(2, .6, .1, .2);
    const opFunc = vtkPiecewiseFunction.newInstance();
    opFunc.addPoint(0, 0.);
    opFunc.addPoint(1, 0.4);
    opFunc.addPoint(2, 1.);
    
    actor.getProperty().setRGBTransferFunction(0, ctFunc);
    actor.getProperty().setScalarOpacity(0, opFunc);
    //actor.getProperty().setScalarOpacityUnitDistance(0, 3.);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setShade(false);

    //pdActors.push(actor);
    pdActors[numFiles] = actor;

    //console.log(actor.getBounds())
    resetCamera(); // Has to be called for each file!
    render();
console.log("Image loaded!");
});

/*for (var i = 0; i < numFiles +1; i++)
{
    console.log(pdActors[i].getBounds());
}*/

//
// UI  control handling
//
fullScreenRenderer.addController(controlPanel);
const maskButtons = document.querySelectorAll('.mask');
let count = maskButtons.length;
while (count--)
{
    maskButtons[count].addEventListener('change', (e) =>
    {
        //const mask = !!e.target.checked; // e is event
        const index = Number(e.target.dataset.layer);
        pdActors[index].setVisibility(!!e.target.checked);
        renderWindow.render();
        console.log(index);
        console.log(pdActors[index].getBounds());
    });
}
/*const showBtn = document.getElementById("ShowAll");
showBtn.addEventListener('click', (e) =>
{
    for (let i = 1; i < numFiles; i++)
    {
        maskButtons[i].checked = true;   
        pdActors[i].setVisibility(true);
    }
    renderWindow.render();
});*/
const hideBtn = document.getElementById("HideAll");
hideBtn.addEventListener('click', (e) =>
{
    for (let i = 1; i < numFiles; i++)
    {
        maskButtons[i].checked = false;   
        pdActors[i].setVisibility(false);
    }
    renderWindow.render();
});
//console.log('Okay!')

//
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
//

//global.reader = reader;
global.fullScreenRenderer = fullScreenRenderer;
