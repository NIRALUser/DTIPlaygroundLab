import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import { getUUID } from 'src/utils';

export const useDMRIPrep= defineStore('DMRIPrep', {
  state: () => ({
    app: null,
    client: {},
    pipeline: [],
    options: {},
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    logFilePath : '',
    lastLogLine : 0,
    logText: '',
    progressMessage: {},
    executionId: getUUID(),
  }),
  actions: {
    reset() {
      this.inProgress = false;
      this.isFailed = false;
      this.isSuccessful = false;
      this.resetLog();
      this.executionId =  getUUID();
    },
    resetLog() {
      this.lastLogLine = 0;
      this.logText = '';
    },
    async initialize() {
      if (this.app) return;
      try {
        const $c = useClientStore();
        const client = await $c.client;
        const { data } = await client.DMRIPrep_getApplicationInfo();
        this.app = data;
        this.client = client;
        this.progressMessage = {message: 'Application data loaded', timeout: 1000, color : 'green'};
      } catch (e) {
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      }       
    },
    async  attachLogfile() {
      const $i = useInterval();
      const $c = useClientStore();
      const client = await $c.client;
      $i.addInterval(this.executionId, async () => {
          await client.getTextFileContent(`${this.logFilePath}`, this.lastLogLine).then((r) => {
            const { data } = r;
            this.logText = this.logText + data.join('')
            this.lastLogLine = this.lastLogLine + data.length;
          });
          
        },5000);
    },
    async  detachLogfile() {
      const $i = useInterval();
      $i.removeInterval(this.executionId);
    },
    async getTemplate(name) {
     try {
        const { data } = await this.client.DMRIPrep_getTemplate(name);
        // this.progressMessage = {message: `Template Loaded : ${name}`, timeout: 1000, color : 'green'};
        return data.ui;
      } catch (e) {
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      }        
    },
    async prepare(payload) {
      try {
        const $c = useClientStore();
        const client = await $c.client;
        const data = await client.DMRIPrep_generateOutputDirectory(payload);
        this.progressMessage = {message: 'Parameter generated successfully', timeout: 1000, color : 'green'};
      } catch (e) {
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      } 
    },
    async execute(payload) {
      this.logFilePath = `${payload.output_dir}/log.txt`;
      const $c = useClientStore();
      const client = await $c.client;
      this.reset();
      try {
        await this.prepare(payload);
        const exc_payload = {
          output_dir : payload.output_dir
        };
        this.attachLogfile();
        this.inProgress = true;
        const data = await client.DMRIPrep_execute(exc_payload);
        this.isSuccessful = true;
        this.progressMessage = { message: 'DTI Atlas building has been fnished', timeout:20000, color:'green', actions:[{icon:'close'}]};
      } catch (e) {
        this.isSuccessful = false;
        this.isFailed = true;
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      } finally {
        this.inProgress = false
        setTimeout(() => {
          this.detachLogfile();
        },10000);
      }      
    }
  }
});