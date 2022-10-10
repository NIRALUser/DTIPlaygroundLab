<template>
  <div>
      <q-tabs
        v-model="tab"
        inline-label
        class="bg-black text-white shadow-2"
      >
            <q-tab name="main" icon="home"><div class="q-pa-sm text-bold gt-md">DMRI Atlas Builder</div><q-tooltip>DMRI Atlas Builder Home</q-tooltip></q-tab>
            <q-tab name="hbuild" icon="account_tree"><div class="q-pa-sm text-bold gt-md">HBuild</div><q-tooltip>HBuild Tree</q-tooltip></q-tab>
            <q-tab name="affineatlas" icon="transform"><div class="q-pa-sm text-bold gt-md">Affine Atlas</div><q-tooltip>Affine Atlas Parameters</q-tooltip></q-tab>
            <q-tab name="diffeomorphicatlas" icon="polyline"><div class="q-pa-sm text-bold gt-md">Diffeomorphic Atlas</div><q-tooltip>Diffeomorphic Atlas Parameters</q-tooltip></q-tab> 
            <q-tab name="finalresample" icon="loop" ><div class="q-pa-sm text-bold gt-md">Final Resampling</div><q-tooltip>Resampling Parameters</q-tooltip></q-tab> 
            <q-tab name="execution" icon="directions_run" ><div class="q-pa-sm text-bold gt-md">Execution</div><q-tooltip>Execution variables & command</q-tooltip></q-tab> 
      </q-tabs>
      <div>
        <template v-if="running">
          <q-spinner-cube
            class="q-ma-xs"
            size="sm"
            :color="'primary'"
          />
        </template>
        <template v-else>
          <template v-if="success">
            <q-icon name="check_circle_outline" class="q-ma-xs"
              size="sm" color="secondary"/>
          </template>
          <template v-else>
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="hasRun ? 'red' : 'transparent'"/>
          </template>
        </template>
        <q-btn flat :disable="running" @click="dumpParams">Dump Params</q-btn>
        <q-btn flat :disable="running" @click="removeStorage">Remove Storage</q-btn>
        <q-btn flat :disable="running" @click="generateRemoteParams">Generate Remote Params</q-btn>
        <q-btn flat :disable="running" @click="execute">Execute</q-btn>
        <q-btn flat :disable="running" @click="attachLogfile">Attach logfile</q-btn>
      </div>

      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <DMRIAtlasBuilderHome />
        </q-tab-panel>
        <q-tab-panel name="hbuild">
          <HBuild :disable="running" v-model="hbuild" v-on:changed-param="onParamChangedHbuild"/>
        </q-tab-panel>
        <q-tab-panel name="affineatlas">
            <AutoForm :disable="running" v-model="parameters.affine_atlas" :template="template.parameter_groups.affine_atlas" v-on:changed-param="onParamChanged"/>
        </q-tab-panel>
        <q-tab-panel name="diffeomorphicatlas">
            <EditableTable :disable="running" v-model = "greedy" v-on:changed-param="onParamChangedGreedy"/>
            <AutoForm :disable="running" v-model="parameters.diffeomorphic_atlas" :template="template.parameter_groups.diffeomorphic_atlas" v-on:changed-param="onParamChanged"/>
        </q-tab-panel>
        <q-tab-panel name="finalresample">
            <AutoForm :disable="running" v-model="parameters.final_resample" :template="template.parameter_groups.final_resample" v-on:changed-param="onParamChanged"/>
        </q-tab-panel>
        <q-tab-panel name="execution">
            <AutoForm :disable="running" v-model="parameters.execution" :template="template.parameter_groups.execution" v-on:changed-param="onParamChanged"/>
        </q-tab-panel>
      </q-tab-panels>
      <q-separator/>
      <LogBox v-if="hasRun" v-model="logtext" ref="logBox" :title="`Execution Log :${parameters.execution.m_OutputPath}/log.txt`"/>
  </div>

</template>

<script lang='ts'>

import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import { useClientStore, useNotificationStore, useInterval } from 'src/stores';
import lodash from 'lodash';
import HBuild from './hbuild/HBuild.vue';
import AutoForm from 'src/components/AutoForm.vue';
import EditableTable from 'src/components/EditableTable.vue';
import LogBox from '/src/components/LogBox.vue';
import DMRIAtlasBuilderHome from './intro/DMRIAtlasBuilderHome.vue';
import { hbuildFromQtree } from './hbuild/treeconvert';
import { useQuasar } from 'quasar';
import { convertABParameters } from './convert';

export default defineComponent({
  components: { 
                HBuild, 
                AutoForm,
                EditableTable,
                DMRIAtlasBuilderHome,
                LogBox
              },
  setup (props, ctx) {
    const hbuild = ref<any[]>([]);
    const parameters = ref<any>(null);
    const greedy = ref<any>(null);
    const template = ref<any>();
    const template_greedy = ref<any>();
    const last_line = ref<number>(0);
    const logtext = ref<string | null>('');
    const tab = ref<string>(null);
    const logBox = ref(null);
    const running = ref(false);
    const success = ref(false);
    const hasRun = ref(false);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();

    async function loadRemoteTemplates() {
      const client = await $c.client;
      const uri = `${ window.location.origin }/templates/dmriatlasbuilder.json`;
      const { data } = await client.axios.get(uri);
      template.value = data; 
      const tables_uri = `${ window.location.origin }/templates/tables.json`;
      const { data : tables } =  await client.axios.get(tables_uri);
      template_greedy.value = tables.greedy;

    }
    function loadDefaultParameters() {
      let res = {};
      lodash.forIn(template.value.parameter_groups, (v, k) => {
        const pairs = v.parameters.map((x) => ([x.name, x.value]));
        res[k] = lodash.fromPairs(pairs);
      });
      parameters.value = res;
      greedy.value = template_greedy.value.table
    }

    function onParamChanged(val) {
      console.log("Params, Changed");
      console.log(val);
      saveCacheItemsParams();
    }
    function onParamChangedHbuild(val) {
      console.log("HBuild, Changed");
      console.log(val);
      saveCacheItemsTree();
    }
    function onParamChangedGreedy(val) {
      console.log("Greedy, Changed");
      console.log(val);
      saveCacheItemsGreedy();
    }
    function dumpParams(ev) {
      console.log('Tree',hbuild.value);
      console.log('Params',parameters.value);
      console.log('Greedy',greedy.value);
      console.log('sessionStorage-Tree',JSON.parse(sessionStorage.getItem('dmriatlasbuilder-tree')));
      console.log('sessionStorage-Params',JSON.parse(sessionStorage.getItem('dmriatlasbuilder-parameters')));
      console.log('sessionStorage-Greedy',JSON.parse(sessionStorage.getItem('dmriatlasbuilder-greedy')));
    }
    function removeStorage(ev) {
      sessionStorage.clear()
    }
    async function generateRemoteParams(ev) {
      if (!hbuild.value || !parameters.value || hbuild.value.length < 1 || parameters.value.execution.m_OutputPath.length < 1) {
        $q.notify({message: 'Parameters are not ready', timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
        return;
      }
      const client = await $c.client;
      const payload = {
        output_dir: parameters.value.execution.m_OutputPath,
        hbuild: hbuildFromQtree(hbuild.value[0]),
        config: convertABParameters(parameters.value),
        greedy: greedy.value,
      };
      try {
        const data = await client.DMRIAtlasbuilder_generateOutputDirectory(payload);
        $q.notify({message: 'Parameter generated successfully', timeout: 1000, color : 'green'});
      } catch (e) {
        $q.notify({message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
      }
    }
    async function execute(ev) {
      if (!hbuild.value || !parameters.value || hbuild.value.length < 1 || parameters.value.execution.m_OutputPath.length < 1) {
        $q.notify({message: 'Parameters are not ready', timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
        return;
      }
      success.value = false
      logtext.value = '';
      const client = await $c.client;
      const payload = {
        output_dir: parameters.value.execution.m_OutputPath,
        hbuild: hbuildFromQtree(hbuild.value[0]),
        config: convertABParameters(parameters.value),
        greedy: greedy.value,
      };
      try {
        const data = await client.DMRIAtlasbuilder_generateOutputDirectory(payload);
        $q.notify({message: 'Parameter generated successfully', timeout: 1000, color : 'green'});
      } catch (e) {
        $q.notify({message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
      }
      try {
        const exc_payload = {
          output_dir : payload.output_dir
        };
        attachLogfile();
        running.value = true;
        hasRun.value = true
        const data = await client.DMRIAtlasbuilder_execute(exc_payload);
        success.value = true;
        $q.notify({ message: 'DTI Atlas building has been fnished', timeout:20000, color:'green', actions:[{icon:'close'}]});
      } catch (e) {
        success.value = false;
        $q.notify({message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
      } finally {
        running.value = false
        setTimeout(() => {
          detachLogfile();
        },10000);
      }
    }
    async function attachLogfile() {
      const client = await $c.client;
      const output_dir = parameters.value.execution.m_OutputPath;
      $i.addInterval('logging', async () => {
          await client.getTextFileContent(`${output_dir}/log.txt`, last_line.value).then((r) => {
            const { data } = r;
            const text = logtext.value + data.join('')
            logtext.value = text
            last_line.value = last_line.value + data.length;
            console.log('Input changed');
            logBox.value.scrollToEnd();
          });
          
        },5000);
    }
    async function detachLogfile() {
      $i.removeInterval('logging');
    }

    function saveCacheItemsTree() {
      sessionStorage.setItem('dmriatlasbuilder-tree', JSON.stringify(hbuild.value));
    }
    function saveCacheItemsGreedy() {
      sessionStorage.setItem('dmriatlasbuilder-greedy', JSON.stringify(greedy.value));
    }
    function saveCacheItemsParams() {
      sessionStorage.setItem('dmriatlasbuilder-parameters', JSON.stringify(parameters.value));
    }
    function loadCachedTabIndex() {
      if (!('dmriatlasbuilder-tab' in sessionStorage)) return;
      tab.value = sessionStorage.getItem('dmriatlasbuilder-tab');
    }
    function loadCachedItemsTree() {
      if (!('dmriatlasbuilder-tree' in sessionStorage)) return;
      console.log('Tree Cache loaded');
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriatlasbuilder-tree'));
      hbuild.value = cachedParams;
    }
    function loadCachedItemsGreedy() {
      if (!('dmriatlasbuilder-greedy' in sessionStorage)) return;
      console.log('Greedy Cache loaded');
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriatlasbuilder-greedy'));
      greedy.value = cachedParams;
    }
    function loadCachedItemsParams() {
      if (!('dmriatlasbuilder-parameters' in sessionStorage)) return;
      console.log('Params Cache loaded');
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriatlasbuilder-parameters'));
      parameters.value = cachedParams;
    }

    watch(tab, (nv, ov) => {
      console.log(tab.value);
      sessionStorage.setItem('dmriatlasbuilder-tab', tab.value);
    });
    onBeforeMount(async () => {
      detachLogfile();
      console.log('before mount');
      loadCachedItemsParams();
      loadCachedItemsTree();
      loadCachedItemsGreedy();
      console.log('before mount ends');
      
    });
    onMounted(async () => {
      if (!parameters.value) {
        await loadRemoteTemplates();
        loadDefaultParameters();
      } else {
        await loadRemoteTemplates();
      }
      if (!greedy.value) {
        loadDefaultParameters();
      }
      loadCachedTabIndex();
      $q.notify({ message : "Starting DMRI Atlas Builder", color: "green", timeout: 1000});
    });
    onUnmounted(() => {
      detachLogfile();
    });
    return {
      hbuild,
      template,
      parameters,
      greedy,
      tab,
      onParamChanged,
      onParamChangedHbuild,
      onParamChangedGreedy,
      dumpParams,
      removeStorage,
      generateRemoteParams,
      execute,
      attachLogfile,
      logtext,
      logBox,
      running,
      success,
      hasRun,
    }
  }
});

</script>