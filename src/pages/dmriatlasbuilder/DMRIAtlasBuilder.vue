<template>
  <div>
      <div class="bg-black text-white" v-if="parameters && hbuild">
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
          <template v-else-if="failed">
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="hasRun ? 'red' : 'transparent'"/>
          </template>
          <template v-else>
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="'transparent'"/>
          </template>
        </template>
<!--         <q-btn flat :disable="running" @click="dumpParams">Dump Params</q-btn> -->
<!--         <q-btn flat  @click="loadDir">Load Dir</q-btn> -->
        <q-btn flat  @click="loadParams">Load Params</q-btn>
        <q-btn flat  @click="loadGreedy">Load Greedy</q-btn>
        <q-input ref="fileInput" style="display:none" v-model="localFile" type="file" label="Standard" ></q-input>
        <q-btn flat :color="validateAtlasParams(parameters, hbuild[0]) ? 'primary': 'red'" 
              :disable="running || !validateAtlasParams(parameters, hbuild[0])" 
              @click="generateRemoteParams">Generate Build</q-btn>
        <q-btn flat :color="validateAtlasParams(parameters, hbuild[0]) ? 'primary': 'red'" 
              :disable="running || !validateAtlasParams(parameters, hbuild[0])" 
              @click="execute">Execute</q-btn>
        <q-btn v-if="running" flat color="red" 
              @click="abort">Cancel</q-btn>

      </div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="hbuild" icon="account_tree"><div class="q-pa-sm text-bold gt-sm">Input</div><q-tooltip>HBuild Tree</q-tooltip></q-tab>
              <q-tab name="affineatlas" icon="transform"><div class="q-pa-sm text-bold gt-sm">Affine Atlas</div><q-tooltip>Affine Atlas Parameters</q-tooltip></q-tab>
              <q-tab name="diffeomorphicatlas" icon="polyline"><div class="q-pa-sm text-bold gt-sm">Diffeomorphic Atlas</div><q-tooltip>Diffeomorphic Atlas Parameters</q-tooltip></q-tab> 
              <q-tab name="finalresample" icon="loop" ><div class="q-pa-sm text-bold gt-sm">Final Resampling</div><q-tooltip>Resampling Parameters</q-tooltip></q-tab> 
        </q-tabs>
      </div>
      <q-separator/>
      <div>
            <q-splitter 
                v-model="splitterModel"
                horizontal>
                <template v-slot:before>
                  <div>
                    <q-tab-panels v-model="tab" animated >
                      <q-tab-panel name="hbuild">
                        <AutoForm v-if="parameters" :root="root" v-on:changed-dir="onChangedDir" :disable="running" v-model="parameters.execution" :template="template.parameter_groups.execution.parameters" />
                        <HBuild :disable="running" v-model="hbuild"  :root="root" v-on:changed-dir="onChangedDir"/>
                      </q-tab-panel>
                      <q-tab-panel name="affineatlas">
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir" :disable="running" v-model="parameters.affine_atlas" :template="template.parameter_groups.affine_atlas.parameters"/>
                      </q-tab-panel>
                      <q-tab-panel name="diffeomorphicatlas">
                          <EditableTable :disable="running" v-model = "greedy" />
                          <AutoForm :disable="running" v-model="parameters.diffeomorphic_atlas" :template="template.parameter_groups.diffeomorphic_atlas.parameters" />
                      </q-tab-panel>
                      <q-tab-panel name="finalresample">
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir" :disable="running" v-model="parameters.final_resample" :template="template.parameter_groups.final_resample.parameters" />
                      </q-tab-panel>
<!--                       <q-tab-panel name="settings">
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir" :disable="running" v-model="parameters.execution" :template="template.parameter_groups.execution.parameters" />
                      </q-tab-panel> -->
                    </q-tab-panels>
                  </div>
                </template>
                <template v-slot:after>
                    <div>
                        <q-footer class="bg-white text-black">
                          <LogBox v-if="logtext.length > 0" v-model="logtext" ref="logBox" :title="`Execution Log :${parameters.execution.m_OutputPath}/log.txt`"/>
                        </q-footer>
                    </div>
                </template>
            </q-splitter>
        </div>
  </div>

</template>

<script lang='ts'>

import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import HBuild from './hbuild/HBuild.vue';
import AutoForm from 'src/components/AutoForm.vue';
import EditableTable from 'src/components/EditableTable.vue';
import LogBox from '/src/components/LogBox.vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useClientStore, useInterval,useGlobalNotification , useGlobalVariables } from 'src/stores/dtiplayground';
import { useDMRIAtlas } from 'src/stores/dmriatlasbuilder';
import { hbuildFromQtree, convertABParameters } from './convert';
import { validateAtlasParams } from './validation';

export default defineComponent({
  components: { 
                HBuild, 
                AutoForm,
                EditableTable,
                LogBox
              },
  setup (props, ctx) {
    const $r = useDMRIAtlas();
    const logBox = ref(null);
    const hasRun = ref(false);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const {
      splitterModel,
      hbuild,
      parameters,
      greedy,
      template,
      template_greedy,
      tab,
      root,
    } = storeToRefs($r);
    const { 
            app, 
            status, 
            inProgress : running, 
            isSuccessful: success, 
            logText: logtext, 
            progressMessage : message, 
            isFailed: failed 
    } = storeToRefs($r);
    const fileInput = ref(null);
    const localFile = ref<any>(null);
    const currentLoadingType = ref<string>(null);

    async function loadRemoteTemplates() {
      template.value = app.value; 
      template_greedy.value = app.value.tables.greedy;
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
    function dumpParams(ev) {
      console.log('Tree',hbuild.value);
      console.log('Params',parameters.value);
      console.log('Greedy',greedy.value);
    }
    async function generateRemoteParams(ev) {
      if (!hbuild.value || !parameters.value || hbuild.value.length < 1 || parameters.value.execution.m_OutputPath.length < 1) {
        $q.notify({message: 'Parameters are not ready', timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
        return;
      }
      const payload = {
        output_dir: parameters.value.execution.m_OutputPath,
        hbuild: hbuildFromQtree(hbuild.value[0]),
        config: convertABParameters(parameters.value),
        greedy: greedy.value,
      };
      $r.generateProjectDirectory(payload);
    }

    async function execute(ev) {
      if (!hbuild.value || !parameters.value || hbuild.value.length < 1 || parameters.value.execution.m_OutputPath.length < 1) {
        $q.notify({message: 'Parameters are not ready', timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
        return;
      }
      hasRun.value = true;
      const payload = {
        output_dir: parameters.value.execution.m_OutputPath,
        hbuild: hbuildFromQtree(hbuild.value[0]),
        config: convertABParameters(parameters.value),
        greedy: greedy.value,
      };
      $r.executeDMRIAtlasBuilder(payload);
    }
    async function openParamsFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const params = JSON.parse(ev.target.result);
        console.log(params);
        localFile.value = null;
      });
      await reader.readAsText(file);
    }
    async function openGreedyFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const greedy = JSON.parse(ev.target.result);
        console.log(greedy);
        localFile.value = null;
      });
      await reader.readAsText(file);
    }
    function loadDir(ev) {

    }
    function loadParams(ev) {
      currentLoadingType.value = 'params';
      fileInput.value.$el.click();
    }
    function loadGreedy(ev) {
      currentLoadingType.value = 'greedy';
      fileInput.value.$el.click();
    }
    function onChangedDir(ev) {
      root.value = ev;
    }
    async function abort(ev) {
      await $r.cancel()
    }
    watch(message, (nv,ov) => {
      $n.notify(message.value);
    })
    watch(localFile, async (nv, ov) => {
      if (!nv) return;
      console.log(currentLoadingType.value);
      console.log(nv);
      if (nv.length < 1) return;
      const file = nv[0];
      if (currentLoadingType.value === 'params') {
        await openParamsFile(file);
      } else if (currentLoadingType.value === 'greedy') {
        await openGreedyFile(file);
      } else {

      }
    });
    watch(tab, (nv, ov) => {
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      await $r.initialize();
      if (!parameters.value) {
        await loadRemoteTemplates();
        loadDefaultParameters();
      } else {
        await loadRemoteTemplates();
      }
      if (!greedy.value) {
        loadDefaultParameters();
      }
      $g.setApplicationName('Atlas');
      root.value = $g.applicationInfo.home_dir;
    });
    onUnmounted(() => {
    });
    return {
      splitterModel,
      hbuild,
      template,
      parameters,
      greedy,
      tab,
      logtext,
      logBox,
      running,
      success,
      failed,
      hasRun,
      validateAtlasParams,
      root,
      onChangedDir,
      abort,

      // IO
      loadDir,
      loadParams,
      loadGreedy,

      //Execution
      generateRemoteParams,
      execute,

      // Elm
      localFile,
      fileInput,
      // Dev
      dumpParams,
    }
  }
});

</script>
