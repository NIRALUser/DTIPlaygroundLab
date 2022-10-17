<template>
  <div>
      <div class="bg-purple text-white">
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
        <q-btn flat :disable="inProgress" @click="dumpParams">Dump Params</q-btn>
        <q-btn flat :disable="inProgress" @click="removeStorage">Remove Storage</q-btn>
      </div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="viewer-vtp" icon="stream" ><div class="q-pa-sm text-bold gt-xs">Tract Viewer (VTP)</div><q-tooltip>View Tractogram in vtp format</q-tooltip></q-tab> 
              <q-tab name="viewer-dwi" icon="image" ><div class="q-pa-sm text-bold gt-xs">DWI Viewer (nrrd/nifti)</div><q-tooltip>View DWI in Nrrd/Nifti</q-tooltip></q-tab> 
              <q-tab name="detail" icon="info_outlined"><div class="q-pa-sm text-bold gt-xs">Details</div><q-tooltip>Image Details</q-tooltip></q-tab>

        </q-tabs>
      </div>
      <q-separator/>
      <div>
            <q-tab-panels v-model="tab" animated >
                  <q-tab-panel name="viewer-vtp">
                        <template v-if="url">
                        </template>
                        <div class="q-pa-auto row">
                            <div class="col-sm-12 col-xs-12"> 
                                <TractViewer :url="url"/>
                            </div>
                        </div>
                  </q-tab-panel>
                  <q-tab-panel name="detail">
                      <div> Detail</div>
                  </q-tab-panel>
            </q-tab-panels>
      </div>
  </div>

</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useClientStore, useInterval,useGlobalNotification,  useGlobalVariables } from 'src/stores/dtiplayground';
import { useDMRIViewer } from 'src/stores/dmriviewer';
import TractViewer from './viewers/TractViewer.vue';

export default defineComponent({
  components: { 
                TractViewer
              },
  setup (props, ctx) {
    const $r = useDMRIViewer();
    const tab = ref<string>('viewer-vtp');
    const root = ref<string>('/');
    const url = ref<string | null>(null);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app, 
            status,
            inProgress , 
            isSuccessful, 
            isFailed } = storeToRefs($r);

    function removeStorage(ev) {
      sessionStorage.clear()
    }
    function dumpParams(ev) {
    }
    function onChangedDir(ev) {
      root.value = ev;
    }
    function loadImage(ev) {
        url.value = 'http://localhost:6543/api/v1/download?path=%2Fmnt%2Fniral%2FZylka%2FDTI%2Ftests-dmriprep%2Ftests%2F20221022-test-8-vtp%2FMMU45938_DTI_HF_fix1_tractogram.vtp'
    }
    function clearImage(ev) {
        url.value = null;
    }
    watch(app, (nv, ov) => {
      console.log(app.value);
    });
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('dmriviewer-tab', tab.value);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      await $r.initialize();
      $g.setApplicationName('Viewer');
    });
    onUnmounted(() => {
    });
    return {
      inProgress,
      isSuccessful,
      isFailed,
      onChangedDir,
      removeStorage,
      dumpParams,
      tab,
      url,
    }
  }
});

</script>
