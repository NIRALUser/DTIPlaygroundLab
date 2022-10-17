
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import { formatBytesToProperUnit, debounce } from '@kitware/vtk.js/macros';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';

// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';

import {
  ColorMode,
  ScalarMode,
} from '@kitware/vtk.js/Rendering/Core/Mapper/Constants';


export class Geometry {
  container: Element;
  background: any;
  pipeline: any;
  style: any;
  scalarBarActor: any;
  userParams: any;
  autoInit: boolean;
  selectorClass: any;

  fullScreenRenderWindow: any;
  renderer: any;
  renderWindow: any;
  rootControllerContainer: any;
  fpsMonitor: any;
  fpsElm: any;
  addDataSetButton: any;
  lutName: string;
  field: string;
  vtpReader: any;
  vtkMapper: any;

  lookupTable: any;
  colorPresets: [];
  componentOptionList: [];
  representationList: [];
  colorByOptions: [];
  dataRange;
  actor;
  scalars;
  preset: string;
  source: any;
  mapper: any;
  activeArray: [];

  constructor(container: Element, userparams: any) {
    this.container = container;
    this.userParams = userparams || vtkURLExtract.extractURLParameters();   
    this.colorPresets = [];
    this.initialize();
    this.prepare(); 
  }

  initialize() {
    this.background = [255,255,255];
    this.pipeline = {};
    this.style = {};
    this.autoInit = false;
    
    this.selectorClass =
      this.background.length === 3 && this.background.reduce((a, b) => a + b, 0) < 1.5
        ? this.style.dark
        : this.style.light; 
    this.lutName = this.userParams.lut || 'erdc_rainbow_bright';
    this.preset = this.lutName;
    // field
    this.field = this.userParams.field || '';

  }

  prepare() {
    this.rootControllerContainer = document.createElement('div');
    this.rootControllerContainer.setAttribute('class', this.style.rootController);

    this.addDataSetButton = document.createElement('img');
    this.addDataSetButton.setAttribute('class', this.style.button);
    this.addDataSetButton.addEventListener('click', () => {
      const isVisible = this.rootControllerContainer.style.display !== 'none';
      this.rootControllerContainer.style.display = isVisible ? 'none' : 'flex';
    });

    this.fpsMonitor = vtkFPSMonitor.newInstance();
    this.fpsElm = this.fpsMonitor.getFpsMonitorContainer();
    this.fpsElm.classList.add(this.style.fpsMonitor);
    this.lookupTable = vtkColorTransferFunction.newInstance();
  }
  setBackground(color: []) {
    this.background = color;
    if(this.fullScreenRenderWindow) {
      this.fullScreenRenderWindow.setBackground(color);
      this.renderWindow.render();
    }
  }
  updateCamera(camera: any) {
    ['zoom', 'pitch', 'elevation', 'yaw', 'azimuth', 'roll', 'dolly'].forEach(
      (key) => {
        if (this.userParams[key]) {
          camera[key](this.userParams[key]);
        }
        this.renderWindow.render();
      }
    );
  }
  resetCamera() {
    this.renderer.resetCamera();
    this.updateCamera(this.renderer.getActiveCamera());
    this.renderWindow.render();
  }
  emptyContainer() {
    this.fpsMonitor.setContainer(null);
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
  createViewer() {
      this.fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
        background: this.background,
        rootContainer: this.container,
        containerStyle: {  height: '100%', width: '100%%', position: 'flex' },
      });
      this.renderer = this.fullScreenRenderWindow.getRenderer();
      this.renderWindow = this.fullScreenRenderWindow.getRenderWindow();
      this.renderWindow.getInteractor().setDesiredUpdateRate(15);

      this.container.appendChild(this.rootControllerContainer);
      this.container.appendChild(this.addDataSetButton);

      this.scalarBarActor = vtkScalarBarActor.newInstance();
      this.renderer.addActor(this.scalarBarActor);

      if (this.userParams.fps) {
        if (Array.isArray(this.userParams.fps)) {
          this.fpsMonitor.setMonitorVisibility(...this.userParams.fps);
          if (this.userParams.fps.length === 4) {
            this.fpsMonitor.setOrientation(this.userParams.fps[3]);
          }
        }
        this.fpsMonitor.setRenderWindow(this.renderWindow);
        this.fpsMonitor.setContainer(this.container);
        this.fullScreenRenderWindow.setResizeCallback(this.fpsMonitor.update);
      }      

  }

  applyPreset(presetName) {
    this.preset = presetName;
    const preset = vtkColorMaps.getPresetByName(presetName);
    this.lookupTable.applyColorMap(preset);
    this.lookupTable.setMappingRange(this.dataRange[0], this.dataRange[1]);
    this.lookupTable.updateRange();
    this.renderWindow.render();
  }

  updateRepresentation(rep) {
      const [visibility, representation, edgeVisibility] = rep
        .split(':')
        .map(Number);
      this.actor.getProperty().set({ representation, edgeVisibility });
      this.actor.setVisibility(!!visibility);
      this.renderWindow.render();
  }
  updateColorBy(colorby) {
    const [location, colorByArrayName] = colorby.split(':');
    const interpolateScalarsBeforeMapping = location === 'PointData';
    let colorMode = ColorMode.DEFAULT;
    let scalarMode = ScalarMode.DEFAULT;
    const scalarVisibility = location.length > 0;
    if (scalarVisibility) {
      const newArray =
        this.source[`get${location}`]().getArrayByName(colorByArrayName);
      this.activeArray = newArray;
      const newDataRange = this.activeArray.getRange();
      this.dataRange[0] = newDataRange[0];
      this.dataRange[1] = newDataRange[1];
      colorMode = ColorMode.MAP_SCALARS;
      scalarMode =
        location === 'PointData'
          ? ScalarMode.USE_POINT_FIELD_DATA
          : ScalarMode.USE_CELL_FIELD_DATA;

      const numberOfComponents = this.activeArray.getNumberOfComponents();
      if (numberOfComponents > 1) {
        // always start on magnitude setting
        if (this.mapper.getLookupTable()) {
          const lut = this.mapper.getLookupTable();
          lut.setVectorModeToMagnitude();
        }
        // componentSelector.style.display = 'block';
        const compOpts = ['Magnitude'];
        while (compOpts.length <= numberOfComponents) {
          compOpts.push(`Component ${compOpts.length}`);
        }
        // componentSelector.innerHTML = compOpts
        //   .map((t, index) => `<option value="${index - 1}">${t}</option>`)
        //   .join('');
        this.componentOptionList = compOpts.map((x, i) => 
          ({value: i-1,label: x}));
      } else {
        // componentSelector.style.display = 'none';
      }
      this.scalarBarActor.setAxisLabel(colorByArrayName);
      this.scalarBarActor.setVisibility(true);
    } else {
      //componentSelector.style.display = 'none';
      this.scalarBarActor.setVisibility(false);
    }
    this.mapper.set({
      colorByArrayName,
      colorMode,
      interpolateScalarsBeforeMapping,
      scalarMode,
      scalarVisibility,
    });

    this.applyPreset(this.preset);
  }

  updateColorByComponent(comp) {
    if (this.mapper.getLookupTable()) {
      const lut = this.mapper.getLookupTable();
      if (comp === -1) {
        lut.setVectorModeToMagnitude();
      } else {
        lut.setVectorModeToComponent();
        lut.setVectorComponent(Number(comp));
        const newDataRange = this.activeArray.getRange(Number(comp));
        this.dataRange[0] = newDataRange[0];
        this.dataRange[1] = newDataRange[1];
        this.lookupTable.setMappingRange(this.dataRange[0], this.dataRange[1]);
        lut.updateRange();
      }
      this.renderWindow.render();
    }
  }
  updateOpacity(op) {
    const opacity = Number(op) / 100;
    this.actor.getProperty().setOpacity(opacity);
    this.renderWindow.render();
  }


  createPipeline(fileName: string, fileContents: any) {
      this.colorPresets = vtkColorMaps.rgbPresetNames.map((x) => ({ value: x, label: x }));
      this.representationList = [
        'Hidden',
        'Points',
        'Wireframe',
        'Surface',
        'Surface with Edge',
      ].map((x, idx) => ({ value: `${idx === 0 ? 0 : 1}:${idx < 4 ? idx - 1 : 2}:${
              idx === 4 ? 1 : 0 }`, label: x}));

      // VTK pipeline
      this.vtpReader = vtkXMLPolyDataReader.newInstance();
      this.vtpReader.parseAsArrayBuffer(fileContents);

      this.lookupTable = vtkColorTransferFunction.newInstance();
      this.source = this.vtpReader.getOutputData(0);
      this.mapper = vtkMapper.newInstance({
        interpolateScalarsBeforeMapping: false,
        useLookupTableScalarRange: true,
        lookupTable: this.lookupTable,
        scalarVisibility: false,
      });
      this.actor = vtkActor.newInstance();
      this.scalars = this.source.getPointData().getScalars();
      this.dataRange = [].concat(this.scalars ? this.scalars.getRange() : [0, 1]);
      this.activeArray = vtkDataArray;
      this.applyPreset(this.lutName);
      this.colorByOptions = [{ value: ':', label: 'Solid color' }].concat(
        this.source
          .getPointData()
          .getArrays()
          .map((a) => ({
            label: `(p) ${a.getName()}`,
            value: `PointData:${a.getName()}`,
          })),
        this.source
          .getCellData()
          .getArrays()
          .map((a) => ({
            label: `(c) ${a.getName()}`,
            value: `CellData:${a.getName()}`,
          }))
      );

      this.actor.setMapper(this.mapper);
      this.mapper.setInputData(this.source);
      this.renderer.addActor(this.actor);

      this.scalarBarActor.setScalarsToColors(this.mapper.getLookupTable());

      // Manage update when lookupTable change
      const debouncedRender = debounce(this.renderWindow.render, 10);
      this.lookupTable.onModified(debouncedRender, -1);

      // First render
      this.renderer.resetCamera();
      this.renderWindow.render();

      this.pipeline[fileName] = {
        actor: this.actor,
        mapper: this.mapper,
        source: this.source,
        lookupTable: this.lookupTable,
        renderer: this.renderer,
        renderWindow: this.renderWindow,
      };

      // Update stats
      this.fpsMonitor.update();
  }
  

  loadFile(file: File) {
      const reader = new FileReader();
      const self = this;
      reader.onload = function onLoad(e) {
        self.createPipeline(file.name, reader.result);
      };
      reader.readAsArrayBuffer(file);
  }


// ----------------------------------------------------------------------------

  load(options, progressCallback) {
      this.autoInit = false;
      this.emptyContainer();

      if (options.files) {
        this.createViewer();
        let count = options.files.length;
        while (count--) {
          this.loadFile(options.files[count]);
        }
        this.updateCamera(this.renderer.getActiveCamera());
      } else if (options.fileURL) {
        const urls = [].concat(options.fileURL);

        if (!this.fullScreenRenderWindow) this.createViewer();
        const nbURLs = urls.length;
        let nbLoadedData = 0;

        /* eslint-disable no-loop-func */
        while (urls.length) {
          const url = urls.pop();
          const name = Array.isArray(this.userParams.name)
            ? this.userParams.name[urls.length]
            : `Data ${urls.length + 1}`;
          HttpDataAccessHelper.fetchBinary(url, {
            progressCallback,
          }).then((binary) => {
            nbLoadedData++;
            // if (nbLoadedData === nbURLs) {
            //   this.container.removeChild(progressContainer);
            // }
            this.createPipeline(name, binary);
            this.updateCamera(this.renderer.getActiveCamera());
          });
        }
      }
  }
}