 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
//import vtkXMLImageDataReader from 'vtk.js/Sources/IO/XML/XMLImageDataReader';
//import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
//import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
//import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';

import controlPanel from './controlPanel_2.html';

//const fileName = 'all_fibers.vtk'; // 'uh60.vtk'; // 'luggaBody.vtk';
const numFiles = 5;
const fileNames = ['hyppara.vtp']; // vtk would not open!
for (let i = 1; i < numFiles; i++)
{
    fileNames.push('hyppara' + i.toString() + '.vtp');
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
const camera = renderer.getActiveCamera();

//
// Read the input files
//
//const polydatas = [];
var pdActors = new Array(numFiles + 1);
//for (let fileName of fileNames)
for (let i = 0; i < numFiles; i++)
{
    const reader = vtkXMLPolyDataReader.newInstance();
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
        if (i==0)
        {
            actor.getProperty().setOpacity(0.2);
            actor.getProperty().setColor(.4, .4, .4);
        }
        else
        {
            actor.getProperty().setColor(.6, .1, .2);
        }
        //console.log(actor.getBounds())
        resetCamera(); // Has to be called for each file!
        render();

        if (i>2)
            pdActors[i].setVisibility(false);
        //console.log(pdActors[i].getBounds());
    });
}
camera.setPosition(0, 0, 1);

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
        //console.log(index);
        //console.log(pdActors[index].getBounds());
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
/*const hideBtn = document.getElementById("HideAll");
hideBtn.addEventListener('click', (e) =>
{
    for (let i = 1; i < numFiles; i++)
    {
        maskButtons[i].checked = false;   
        pdActors[i].setVisibility(false);
    }
    renderWindow.render();
});*/
//console.log('Okay!')
var hideContBtn = document.getElementById("HideCont");
var btnContStatus = 1
hideContBtn.addEventListener('click', (e) =>
{
    if (btnContStatus == 1)
    {
        hideContBtn.innerHTML = 'Show Continuous <i>f</i>';
        maskButtons[1].checked = false;   
        maskButtons[2].checked = false;   
        pdActors[1].setVisibility(false);
        pdActors[2].setVisibility(false);
    }
    else
    {
        hideContBtn.innerHTML = 'Hide Continuous <i>f</i>';
        maskButtons[1].checked = true;   
        maskButtons[2].checked = true;   
        pdActors[1].setVisibility(true);
        pdActors[2].setVisibility(true);
    }
    btnContStatus ^= 1;
    renderWindow.render();
});

var hideDiscBtn = document.getElementById("HideDisc");
var btnDiscStatus = 0
hideDiscBtn.addEventListener('click', (e) =>
{
    if (btnDiscStatus == 1)
    {
        hideDiscBtn.innerHTML = 'Show Discrete <i>f</i>';
        maskButtons[3].checked = false;   
        maskButtons[4].checked = false;   
        pdActors[3].setVisibility(false);
        pdActors[4].setVisibility(false);
    }
    else
    {
        hideDiscBtn.innerHTML = 'Hide Discrete <i>f</i>';
        maskButtons[3].checked = true;   
        maskButtons[4].checked = true;   
        pdActors[3].setVisibility(true);
        pdActors[4].setVisibility(true);
    }
    btnDiscStatus ^= 1;
    renderWindow.render();
});
//
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
//

//global.reader = reader;
global.fullScreenRenderer = fullScreenRenderer;
