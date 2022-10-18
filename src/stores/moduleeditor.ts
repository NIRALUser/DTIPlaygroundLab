import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification, useGlobalVariables } from './dtiplayground';
import lodash from 'lodash';

export const useModuleEditor= defineStore('ModuleEditor', {
  state: () => ({
    app: null,
    client: {},
    currentCode: null,
    splitter1: 20,
    splitter2: 99,
    currentLanguage: 'python',
    currentDir: '/',
    isMarkdown: false,
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    status: {},
    progressMessage: {}
  }),
  actions: {
    async initialize() {
      if (this.app) return;
      const $g = useGlobalVariables();
      await $g.initialize();
      this.app = {}; 
      this.currentDir = `${$g.applicationInfo.config_dir}/modules`;
    }
  }
});