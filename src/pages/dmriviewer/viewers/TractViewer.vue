<template>
  <div class="q-pa-auto content-body">
    <div class="q-pa-auto row">
      <div class="q-pa-auto col-sm-5 col-xs-12">
        <q-input ref="fileInput" dense v-model="localFile" type="file" accept=".vtp">
            <template v-slot:append="prop">
              <q-btn flat color="primary" icon="refresh" @click="loadFromFile"></q-btn>
            </template>
        </q-input>
        <q-input dense v-model="url" type="text" label="File URL" clearable>
            <template v-slot:append="prop">
              <q-btn flat color="primary" icon="play_arrow" @click="loadFromUrl"></q-btn>
            </template>
        </q-input>
        <q-select v-model="background" dense map-options  emit-value :options="backgroundOptions" label="Background Color"/>
        <q-select v-if="geometry" v-model="colorBy" dense map-options  emit-value :options="geometry.colorByOptions" label="Color By"/>
        <q-select v-if="geometry" v-model="representation" dense map-options  emit-value :options="geometry.representationList" label="Representation"/>
        <q-select v-if="geometry" v-model="colorPreset" dense map-options options-dense emit-value :options="geometry.colorPresets" label="Color Preset"/>
        <q-select v-if="geometry" v-model="component" dense map-options  emit-value :options="geometry.componentOptionList" label="Component"/>
        <template v-if="geometry">
          <div class="row" v-if="geometry.source">
            <div class="q-pa-xs col-12">
              <q-item>
                <q-item-section>
                  <q-slider  v-model="opacity" dense :min="0" :max="100" label/>
                </q-item-section>
                <q-item-section side>Opacity</q-item-section>
              </q-item>
            </div>
            <div class="q-pa-xs row">
              <q-btn flat icon="highlight_off" color="primary" @click="clear">Clear</q-btn>
            </div>
          </div>
        </template>      
      </div>
      <div class="q-pa-auto col-sm-7 col-xs-12 root-container">
        <q-linear-progress v-if="progress > 0" :value="progress" class="q-mt-md" />
        <div ref="content" class="vtk-content"> </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useClientStore, useInterval,useGlobalNotification,  useGlobalVariables } from 'src/stores/dtiplayground';

import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
import { Geometry } from 'src/components/geometry';
import { useDMRIViewer_TractViewer } from 'src/stores/dmriviewer';

const backgroundOptions = [
  { value: [0,0,0], label: 'Black'},
  { value: [127,127,127], label: 'White'},
];

export default defineComponent({
  props: {
  },
  components: { 

              },
  setup (props, ctx) {
    const root = ref<string>('/');
    const progress = ref(0);
    // const container = ref<any>();
    const $c = useClientStore();
    const $q = useQuasar();
    const $r = useDMRIViewer_TractViewer();
    const { app, 
            status,
            userParams,
            localFile,
            url,
            container,
            background,
            colorBy,
            representation,
            colorPreset,
            component,
            geometry,
            opacity,
            inProgress , 
            isSuccessful, 
            isFailed } = storeToRefs($r);

    function progressCallback(progressEvent: any) {
        if (progressEvent.lengthComputable) {
          const percent = Math.floor((100 * progressEvent.loaded) / progressEvent.total);
          progress.value = percent;
        } else {
          progress.value = 0;
        }
    }
    async function clear(ev) {
      localFile.value = null;
      url.value = null;
      await geometry.value.emptyContainer();
    }
    async function loadFromFile() {
      if (!localFile.value) return;
      geometry.value.setBackground(background.value);
      $r.loadFromFile();
    }
    async function loadFromUrl(ev) {
      if (!url.value) return;
      geometry.value.setBackground(background.value);
      $r.loadFromUrl(progressCallback);
    }
    watch(localFile, (nv, ov) => {
      loadFromFile();
    });
    watch(colorBy, (nv, ov) => {
      geometry.value.updateColorBy(nv);
    });
    watch(component, (nv, ov) => {
      geometry.value.updateColorByComponent(nv);
    });
    watch(background, (nv, ov) => {
      if (!geometry.value) return;
      geometry.value.setBackground(nv);
    });
    watch(representation, (nv, ov) => {
      geometry.value.updateRepresentation(nv);
    });
    watch(colorPreset, (nv, ov)=> {
      geometry.value.applyPreset(nv);
    });
    watch(opacity, (nv, ov) => {
      geometry.value.updateOpacity(nv);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      const rootcontainer = document.querySelector('div.root-container');
      if (!geometry.value) {
        await $r.initializeTractView();
        rootcontainer.appendChild(container.value);
      }
      else {
        rootcontainer.appendChild(container.value);
      }
    });
    onUnmounted(() => {
    });
    return {
      backgroundOptions,
      background,
      representation,
      colorPreset,
      geometry,
      component,
      colorBy,
      opacity,
      progress,
      localFile,
      clear,
      url,
      loadFromUrl,
      loadFromFile,
    }
  }
});

</script>
<style>
/*.vtk-content {
  height:400px;
  width:400px;
}*/
.root-container {
  padding: 10px;
}
</style>