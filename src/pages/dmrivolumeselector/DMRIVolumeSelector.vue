<template>
  <div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="volume-selector-dwi" icon="image" ><div class="q-pa-sm text-bold gt-xs">Dwi Volume Selector (nrrd/nifti)</div><q-tooltip>View DWI in Nrrd/Nifti</q-tooltip></q-tab> 
<!--               <q-tab name="detail" icon="info_outlined"><div class="q-pa-sm text-bold gt-xs">Details</div><q-tooltip>Image Details</q-tooltip></q-tab> -->

        </q-tabs>
      </div>
      <q-separator/>
      <div>
            <q-tab-panels v-model="tab" animated >
                  <q-tab-panel name="volume-selector-dwi">
                      <div> 
                        <DwiVolumeSelector />
                      </div>
                  </q-tab-panel>
                  <q-tab-panel name="detail">
                      <div> 
                        Details
                      </div>
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
import { useDMRIVolumeSelector_DWIVolumeSelector } from 'src/stores/dmrivolumeselector';
import DwiVolumeSelector from './viewers/DwiVolumeSelector.vue';

export default defineComponent({
  components: { 
                DwiVolumeSelector,
              },
  setup (props, ctx) {
    const $r = useDMRIVolumeSelector_DWIVolumeSelector();
    const tab = ref<string>('volume-selector-dwi');
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app, 
            root,
            status,
            geometry,
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
    function clearImage(ev) {
    }
    watch(app, (nv, ov) => {
      // console.log(app.value);
    });
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('dmrivolumeselectortab', tab.value);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      await $r.initialize();
      $g.setApplicationName('Slice');
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
    }
  }
});

</script>
