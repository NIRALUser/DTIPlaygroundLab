import { defineStore, storeToRefs } from 'pinia';
import { useInterval, useClientStore, useGlobalNotification } from './dtiplayground';
import lodash from 'lodash';
import { getUUID } from 'src/utils';

export const useDMRIFiberProfile= defineStore('DMRIFiberProfile', {
  state: () => ({
    app: null,
    root: '$HOME',
    tab: 'settings',
    splitterModel: 50,
    client: {},
    pipeline: [],
    execution: {},
    inProgress : false,
    isSuccessful : false,
    isFailed: false,
    logFilePath : '',
    lastLogLine : 0,
    logText: '',
    status: {},
    progressMessage: {},
    executionId: getUUID(),
    execution_command: 'dmrifiberprofile run -i <input datasheet> -p <input protocol>'
  }),
  actions: {
    clearProtocols() {
      this.pipeline = []
    },
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
        const { data } = await client.DMRIFiberProfile_getApplicationInfo();
        this.app = data;
        this.client = client;
        this.execution = this.getDefaultValues(this.app.protocol_template.ui.execution);
        this.sortModules();
        this.progressMessage = {message: 'Application data loaded', timeout: 1000, color : 'green'};
      } catch (e) {
        console.log(e);
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      }
    },
    sortModules() {
      const default_pipeline = this.app.protocol_template.options.execution.pipeline.default_value;
      //console.log(default_pipeline);
      this.app.modules.system = this.app.modules.system.sort((x,y) => {
          // console.log(default_pipeline.indexOf(x.name),x.name);
          const xv = default_pipeline.indexOf(x.name) >= 0 ? default_pipeline.indexOf(x.name) : 999;
          const yv = default_pipeline.indexOf(y.name) >= 0 ? default_pipeline.indexOf(y.name) : 999;
          if ( xv > yv ) {
            return 1;
          } else if (xv < yv) {
            return -1;
          } else {
            return 0;
          }

          //console.log(res);
          return res;
      });
      //console.log(this.app.modules);
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
          await client.getTextWholeFile(`${this.execution.output_directory}/status.json`).then((r) => {
            const { data } = r;
            this.status = JSON.parse(data);
          });

        },5000);
    },
    async  detachLogfile() {
      const $i = useInterval();
      $i.removeInterval(this.executionId);
    },
    getDefaultValues(template): any {
      const pairs = template.map((x) => ([x.name, x.default_value]));
      const defvals = lodash.fromPairs(pairs);
      return defvals;
    },
    async getTemplate(name): Promise<any> {
     try {
        const { data } = await this.client.DMRIFiberProfile_getTemplate(name);
        return data.ui;
      } catch (e) {
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      }
    },
    async setProtocols(data) {
      const new_pipeline = [];
      this.execution = data.io;
      lodash.forEach(data.pipeline, async (x) => {
        const [name, value] = x;
        const id = getUUID();
        new_pipeline.push({ id, name, value, template : this.getTemplate(name) });
      });
      const res = await Promise.all(new_pipeline.map((x) => x.template));
      new_pipeline.forEach((v, i ) => {
        v.template = res[i];
      });
      this.pipeline = new_pipeline;
    },
    async prepare(payload): any {
      try {
        const $c = useClientStore();
        const client = await $c.client;
        const payload = {
          output_dir: this.execution.output_directory,
          pipeline: this.pipeline.map((x) => [x.name,x.value]),
          io: this.execution
        }
        const data = await client.DMRIFiberProfile_generateOutputDirectory(payload);
        this.progressMessage = {message: 'Protocol directory generated successfully', timeout: 1000, color : 'green'};
        return payload;
      } catch (e) {
        console.log(e);
        if (e.response !== undefined ) this.progressMessage = {message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]};
        else this.progressMessage = {message: 'Connection Error', timeout: 1000, color : 'red', actions: [{icon: 'close'}]};
      }
    },
    async execute(payload) {
      const $c = useClientStore();
      const client = await $c.client;
      this.reset();
      try {
        const payload = {
            output_dir: this.execution.output_directory,
            pipeline: this.pipeline.map((x) => [x.name,x.value]),
            io: this.execution
        };
        this.logFilePath = `${payload.output_dir}/log.txt`;
        await this.prepare(payload);
        this.attachLogfile();
        this.inProgress = true;
        const data = await client.DMRIFiberProfile_execute(payload);
        this.isSuccessful = true;
        this.progressMessage = { message: 'DMRI fiber profiling has been finished', timeout:20000, color:'green', actions:[{icon:'close'}]};
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
