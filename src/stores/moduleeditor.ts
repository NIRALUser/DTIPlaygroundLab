import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import lodash from 'lodash';

export const useModuleEditor= defineStore('ModuleEditor', {
  state: () => ({
    app: null,
    client: {},
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    status: {},
    progressMessage: {}
  }),
  actions: {
    async initialize() {
      if (this.app) return;   
    }
  }
});