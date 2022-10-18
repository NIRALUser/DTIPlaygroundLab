import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import lodash from 'lodash';
import { Geometry } from 'src/components/geometry';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';

export const useDMRIViewer_TractViewer= defineStore('DMRIViewer', {
  state: () => ({
    app: null,
    client: {},
    container: null,
    url: null,
    localFile: null,
    background: [0,0,0],
    colorBy : 'Solid color',
    representation: 'Surface',
    colorPreset: 'erdc_rainbow_bright',
    component: 'Magnitude',
    opacity: 100,
    geometry: null,
    userParams : vtkURLExtract.extractURLParameters(),
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    status: {},
    progressMessage: {}
  }),
  actions: {
    async initialize() {
      if (this.app) return;   
    },
    async initializeTractView() {
      this.container = document.createElement('div');
      this.geometry = new Geometry(this.container, this.userParams);
    },
    async loadFromFile() {
      this.userParams.files = this.localFile;
      this.userParams.fileURL = null;
      await this.geometry.load(this.userParams, null);
    },
    async loadFromUrl(progress_callback) {
      this.userParams.files= null;
      this.userParams.fileURL = [this.url];
      await this.geometry.load(this.userParams, progress_callback);
    },
    reset() {
      this.url= null;
      this.localFile= null;
      this.background=[0,0,0];
      this.colorBy ='Solid color';
      this.representation= 'Surface';
      this.colorPreset= 'erdc_rainbow_bright';
      this.component= 'Magnitude';
      this.opacity =100;
      this.userParams = vtkURLExtract.extractURLParameters();
    }
  }
});

