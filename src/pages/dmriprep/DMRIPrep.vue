<template>
  <div>
      <div class="bg-black text-white">
        <template v-if="inProgress">
          <q-spinner-cube
            class="q-ma-xs"
            size="sm"
            :color="'primary'"
          />
        </template>
        <template v-else>
          <template v-if="isSuccessful">
            <q-icon name="check_circle_outline" class="q-ma-xs"
              size="sm" color="primary"/>
          </template>
          <template v-else-if="isFailed">
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="hasRun ? 'red' : 'transparent'"/>
          </template>
          <template v-else>
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="'transparent'"/>
          </template>
        </template>
<!--         <q-btn flat :disable="inProgress" @click="dumpParams">Dump Params</q-btn>
        <q-btn flat :disable="inProgress" @click="removeStorage">Remove Storage</q-btn> -->
        <q-btn flat :color="validatePrepParams(io) ? 'primary': 'red'" 
              :disable="inProgress || !validatePrepParams(io)" 
              @click="prepare">Generate Protocols</q-btn>
        <q-btn flat :color="validatePrepParams(io) ? 'primary': 'red'" 
              :disable="inProgress || !validatePrepParams(io)" 
              @click="execute">Execute</q-btn>
        <q-btn v-if="inProgress" flat color="red" 
              @click="abort">Cancel</q-btn>
      </div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="settings" icon="image" ><div class="q-pa-sm text-bold gt-xs">Input</div><q-tooltip>Execution variables & command</q-tooltip></q-tab> 
              <q-tab name="pipeline" icon="view_carousel"><div class="q-pa-sm text-bold gt-xs">QC Protocol</div><q-tooltip>QC Module Pipelining and protocol setup</q-tooltip></q-tab>

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
                      <q-tab-panel name="settings">
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir" v-if="app" :disable="inProgress" v-model="io" :template="app.protocol_template.ui.execution" v-on:changed-param="onChanged"/>
                          <q-item dense>
                            <q-item-section>
                              <q-input dense v-model="execution_command" label="Commandline Execution Command"> 
                                <template v-slot:append="props">
                                   <q-btn flat color="primary" icon="content_copy" @click="copyExecutionCommand" label="Copy"/>
                                   <q-tooltip>Copy execution command for command line execution</q-tooltip>
                                </template>
                              </q-input>
                            </q-item-section>
                          </q-item>
                      </q-tab-panel>
                      <q-tab-panel name="pipeline">
                        <Protocols :root="root" v-on:changed-dir="onChangedDir" :disable="inProgress" v-on:changed-param="onChanged"/>
                      </q-tab-panel>

                    </q-tab-panels>
                  </div>
                </template>
                <template v-slot:after>
                    <div>
                        <q-footer class="bg-white text-black">
                          <LogBox v-if="logText.length > 0" v-model="logText" ref="logBox" :title="`Execution Log :${logFilePath}`"/>
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
import Protocols from './protocols/Protocols.vue';
import AutoForm from 'src/components/AutoForm.vue';
import LogBox from '/src/components/LogBox.vue';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useClientStore, useInterval,useGlobalNotification,  useGlobalVariables } from 'src/stores/dtiplayground';
import { validatePrepParams } from './validation';
import { useDMRIPrep } from 'src/stores/dmriprep';

export default defineComponent({
  components: { 
                Protocols,
                AutoForm,
                LogBox
              },
  setup (props, ctx) {
    const $r = useDMRIPrep();
    const logBox = ref(null);
    const hasRun = ref(false);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app,
            root, 
            tab,
            splitterModel,
            status,
            pipeline,
            execution : io,
            inProgress , 
            isSuccessful, 
            logText, 
            logFilePath,
            execution_command,
            progressMessage, 
            isFailed } = storeToRefs($r);


    function onProtocolsChanged(val) {
      saveCacheItemsProtocols();
    }
    function onOptionsChanged(val) {
      saveCacheItemsOptions();
    }

    function dumpParams(ev) {
      console.log('Pipeline',pipeline.value);
      console.log('Options', io.value);
      console.log('sessionStorage-Pipeline',JSON.parse(sessionStorage.getItem('dmriprep-pipeline')));
      console.log('sessionStorage-IO',JSON.parse(sessionStorage.getItem('dmriprep-io')));
    }
    function removeStorage(ev) {
      sessionStorage.clear()
    }
    async function prepare(ev) {
      await $r.prepare();
      execution_command.value = `dmriprep run-dir ${io.value.output_directory}`;
    }

    async function execute(ev) {
      hasRun.value = true;
      await $r.execute();
      execution_command.value = `dmriprep run-dir ${io.value.output_directory}`;
    }

    async function abort(ev) {
      await $r.cancel();
    }
    function copyExecutionCommand(ev) {
      navigator.clipboard.writeText(execution_command.value);
      $q.notify({message: 'Execution command copied to Clipboard', timeout: 1000, color : 'green'});
    }
    function saveCacheItemsPipeline() {
      sessionStorage.setItem('dmriprep-pipeline', JSON.stringify(pipeline.value));
    }
    function saveCacheItemsOptions() {
      sessionStorage.setItem('dmriprep-io', JSON.stringify(io.value));
    }
    function saveCacheWorkingDir() {
      sessionStorage.setItem('dmriprep-workingdir', root.value);
    }
    function loadCachedTabIndex() {
      if (!('dmriprep-tab' in sessionStorage)) {
        tab.value = 'settings';
        return;
      }
      tab.value = sessionStorage.getItem('dmriprep-tab');
    }
    function loadCachedItemsPipeline() {
      if (!('dmriprep-pipeline' in sessionStorage)) return;
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriprep-pipeline'));
      pipeline.value = cachedParams;
    }
    function loadCachedItemsOptions() {
      if (!('dmriprep-io' in sessionStorage)) return;
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriprep-io'));
      io.value = cachedParams;
    }
    function loadCachedWorkingDir() {
      if (!('dmriprep-workingdir' in sessionStorage)) return;
      const cachedParams = sessionStorage.getItem('dmriprep-workingdir');
      root.value = cachedParams;    
    }
    function onChanged(ev) {
      saveCacheItemsOptions();
      saveCacheItemsPipeline();
      // console.log('Protocol changed');
      // console.log('Pipeline',pipeline.value);
      // console.log('Options',io.value);
    }
    function onChangedDir(ev) {
      root.value = ev;
      saveCacheWorkingDir();
    }
    watch(app, (nv, ov) => {
      //console.log(app.value);
    });
    watch(progressMessage, (nv,ov) => {
      $n.notify(progressMessage.value);
    })
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('dmriprep-tab', tab.value);
    });
    onBeforeMount(async () => {
      loadCachedItemsPipeline();
    });
    onMounted(async () => {
      await $r.initialize();
      loadCachedItemsOptions();
      loadCachedTabIndex();
      $g.setApplicationName('Prep');
      root.value = $g.applicationInfo.home_dir;
      loadCachedWorkingDir();
    });
    onUnmounted(() => {
    });
    return {
      splitterModel,
      tab,
      onProtocolsChanged,
      onOptionsChanged,
      dumpParams,
      removeStorage,
      app,
      pipeline,
      io,
      prepare,
      execute,
      execution_command,
      copyExecutionCommand,
      abort,
      logText,
      logFilePath,
      logBox,
      inProgress,
      isSuccessful,
      isFailed,
      hasRun,
      validatePrepParams,
      onChanged,
      root,
      onChangedDir,
    }
  }
});

</script>
