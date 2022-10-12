<template>
  <div>
      <div class="bg-secondary text-white">
        <template v-if="inProgress">
          <q-spinner-cube
            class="q-ma-xs"
            size="sm"
            :color="'black'"
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
        <q-btn v-if="env.DEV" flat :disable="inProgress" @click="dumpParams">Dump Params</q-btn>
        <q-btn v-if="env.DEV" flat :disable="inProgress" @click="removeStorage">Remove Storage</q-btn>
        <q-btn flat :color="validatePrepParams(null) ? 'primary': 'red'" 
              :disable="inProgress || !validatePrepParams(null)" 
              @click="prepare">Generate Protocols</q-btn>
        <q-btn flat :color="validatePrepParams(null) ? 'primary': 'red'" 
              :disable="inProgress || !validatePrepParams(null)" 
              @click="execute">Execute</q-btn>
      </div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="pipeline" icon="view_carousel"><div class="q-pa-sm text-bold gt-xs">QC Protocol</div><q-tooltip>QC Module Pipelining and protocol setup</q-tooltip></q-tab>
              <q-tab name="settings" icon="settings" ><div class="q-pa-sm text-bold gt-xs">Settings</div><q-tooltip>Execution variables & command</q-tooltip></q-tab> 
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
                      <q-tab-panel name="pipeline">
                        <Protocols v-on:changed-param="onChanged"/>
                      </q-tab-panel>
                      <q-tab-panel name="settings">
                        Settings
<!--                           <AutoForm :disable="inProgress" v-model="parameters.execution" :template="template.parameter_groups.execution" v-on:changed-param="onParamChanged"/> -->
                      </q-tab-panel>
                    </q-tab-panels>
                  </div>
                </template>
                <template v-slot:after>
                    <div>
                        <q-footer class="bg-white text-black">
                          <LogBox v-if="logText.length > 0" v-model="logText" ref="logBox" :title="`Execution Log :${parameters.execution.m_OutputPath}/log.txt`"/>
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
    const env = process.env;
    const splitterModel = ref(50);
    const tab = ref<string>(null);
    const logBox = ref(null);
    const hasRun = ref(false);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app, 
            pipeline,
            options,
            inProgress , 
            isSuccessful, 
            logText, 
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
      console.log('Options', options.value);
      console.log('sessionStorage-Pipeline',JSON.parse(sessionStorage.getItem('dmriprep-pipeline')));
      console.log('sessionStorage-Options',JSON.parse(sessionStorage.getItem('dmriprep-options')));
    }
    function removeStorage(ev) {
      sessionStorage.clear()
    }
    async function prepare(ev) {
      $r.prepare(parameters.value);
    }

    async function execute(ev) {
      hasRun.value = true;
      $r.execute(parameters.value);
    }

    function saveCacheItemsPipeline() {
      sessionStorage.setItem('dmriprep-pipeline', JSON.stringify(parameters.value));
    }
    function saveCacheItemsOptions() {
      sessionStorage.setItem('dmriprep-options', JSON.stringify(options.value));
    }
    function loadCachedTabIndex() {
      if (!('dmriprep-tab' in sessionStorage)) {
        tab.value = 'hbuild';
        return;
      }
      tab.value = sessionStorage.getItem('dmriprep-tab');
    }
    function loadCachedItemsPipeline() {
      if (!('dmriprep-pipeline' in sessionStorage)) return;
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriprep-pipeline'));
      parameters.value = cachedParams;
    }
    function loadCachedItemsOptions() {
      if (!('dmriprep-options' in sessionStorage)) return;
      const cachedParams = JSON.parse(sessionStorage.getItem('dmriprep-options'));
      options.value = cachedParams;
    }
    function onChanged(ev) {
      console.log('Protocol changed');
      console.log('Pipeline',pipeline.value);
    }
    watch(pipeline, (nv, ov) => {
      conosle.log('Pipeline changed', nv);
    });
    watch(app, (nv, ov) => {
      console.log(app.value);
    });
    watch(progressMessage, (nv,ov) => {
      $n.notify(progressMessage.value);
    })
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('dmriprep-tab', tab.value);
    });
    onBeforeMount(async () => {
      loadCachedItemsPipeline();
      loadCachedItemsOptions();
    });
    onMounted(async () => {
      await $r.initialize();
      loadCachedTabIndex();
      $g.setApplicationName('Prep');
    });
    onUnmounted(() => {
    });
    return {
      env,
      splitterModel,
      tab,
      onProtocolsChanged,
      onOptionsChanged,
      dumpParams,
      removeStorage,
      pipeline,
      options,
      prepare,
      execute,
      logText,
      logBox,
      inProgress,
      isSuccessful,
      isFailed,
      hasRun,
      validatePrepParams,
      onChanged
    }
  }
});

</script>
