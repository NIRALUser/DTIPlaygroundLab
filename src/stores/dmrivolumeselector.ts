import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import lodash from 'lodash';
import { Geometry } from 'src/components/geometry';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';


export const useDMRIVolumeSelector_DWIVolumeSelector = defineStore('DWIVolumeSelector', {
  state: () => ({
    app: null,
    root: '/',
    slices: {
      x: 0,
      y: 0,
      z: 0,
      g: 0,
    },
    image_size: {
      width: 300,
      height: 300,
    },
    inProgress : false,
    isSuccessful : false,
    selectedFile: null,
    sliceIndex: 0,
    imageMeta: null,
    loading: false,
    pagination: {
      page: 1,
      rowsPerPage: 5,
    },
  }),
  actions: {
    async initialize() {
      if (this.app) return;   
    },
    async getSliceFromDWI(grad_idx,axis_idx,slice_idx) {
      try {
        const $c = useClientStore();
        const client = await $c.client;
        const res = await client.getSliceFromDWI(grad_idx,axis_idx,slice_idx);
        return res;
      } catch (e) {
        console.log(e);
      } 
    },
    async loadImageAsCache(filename) {
      try {
        this.loading = true;
        const $c = useClientStore();
        const client = await $c.client;
        const res = await client.loadImageAsCache(filename);
        return res;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading=false;
      }
    },
    reset() {

    }
  }
});