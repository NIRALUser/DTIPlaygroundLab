import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import { getUUID } from 'src/utils';

export const useDMRIAtlas = defineStore('remoteDMRIAtlas', {
  state: () => ({
    app: null,
    client: {},
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    logFilePath : '',
    lastLogLine : 0,
    logText: '',
    status: {},
    outputDir: '',
    progressMessage: {},
    executionId: getUUID(),
    // Data 
    splitterModel: 50,
    hbuild: [],
    parameters: null,
    greedy: null,
    template: null,
    template_greedy: null,
    tab: 'hbuild',
    root: '$HOME',
  }),
  actions: {
    async reset() {
      this.inProgress = false;
      this.isFailed = false;
      this.isSuccessful = false;
      this.resetLog();
      this.executionId =  getUUID();

      // data;
      this.tab="hbuild";
      this.greedy= null;
      this.hbuild=[];
      this.parameters=null;
      // this.template=null;
      // this.template_greedy=null;
      // await this.initialize();
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
        const { data } = await client.DMRIAtlasbuilder_getApplicationTemplate();
        this.app = data
        this.client = client;
        this.progressMessage = {message: 'Application data loaded', timeout: 1000, color : 'green'};
      } catch (e) {
        console.log(e);
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
          await client.getTextWholeFile(`${this.outputDir}/status.json`).then((r) => {
            const { data } = r;
            this.status = JSON.parse(data);
          });
        },5000);
    },
    async  detachLogfile() {
      const $i = useInterval();
      $i.removeInterval(this.executionId);
    },
    async generateProjectDirectory(payload) {
      try {
        const $c = useClientStore();
        const $n = useGlobalNotification();
        const client = await $c.client;
        const data = await client.DMRIAtlasbuilder_generateOutputDirectory(payload);
        this.progressMessage = {message: 'Parameter generated successfully', timeout: 1000, color : 'green'};
      } catch (e) {
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      } 
    },
    async executeDMRIAtlasBuilder(payload) {
      this.logFilePath = `${payload.output_dir}/log.txt`;
      this.outputDir = payload.output_dir;
      const $c = useClientStore();
      const $n = useGlobalNotification();
      const client = await $c.client;
      this.reset();
      try {
        await this.generateProjectDirectory(payload);
        const exc_payload = {
          output_dir : payload.output_dir
        };
        this.attachLogfile();
        this.inProgress = true;
        const data = await client.DMRIAtlasbuilder_execute(exc_payload);
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
    },
    async cancel() {
        const $c = useClientStore();
        const client = await $c.client;
        await client.KillByPID(this.status.pid);
    }
  }
});