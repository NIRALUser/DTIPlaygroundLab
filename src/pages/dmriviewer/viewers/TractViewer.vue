<template>
  <div class="q-pa-auto content-body">
    <div class="q-pa-auto row">
      <div class="q-pa-auto col-sm-4 col-xs-12">
        <q-input ref="fileInput" dense v-model="localFile" type="file" accept=".vtp"></q-input>
        <q-select v-model="background" dense map-options  emit-value :options="backgroundOptions" label="Background Color"/>
        <q-select v-if="geometryViewer" v-model="colorBy" dense map-options  emit-value :options="geometryViewer.colorByOptions" label="Color By"/>
        <q-select v-if="geometryViewer" v-model="representation" dense map-options  emit-value :options="geometryViewer.representationList" label="Representation"/>
        <q-select v-if="geometryViewer" v-model="colorPreset" dense map-options options-dense emit-value :options="geometryViewer.colorPresets" label="Color Preset"/>
        <q-select v-if="geometryViewer" v-model="component" dense map-options  emit-value :options="geometryViewer.componentOptionList" label="Component"/>
        <template v-if="geometryViewer">
          <div class="row" v-if="geometryViewer.source">
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
      <div class="q-pa-auto col-sm-8 col-xs-12">
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
import { load } from './tract';
import { Geometry } from 'src/components/geometry';

const backgroundOptions = [
  { value: [0,0,0], label: 'Black'},
  { value: [127,127,127], label: 'White'},
];

export default defineComponent({
  props: {
    url: {
      type: String,
    }
  },
  components: { 

              },
  setup (props, ctx) {
    const root = ref<string>('/');
    const localFile = ref();
    const background = ref([0,0,0]);
    const colorBy = ref('Solid Color');
    const representation = ref('Surface');
    const colorPreset = ref('erdc_rainbow_bright');
    const component = ref('Magnitude');
    const opacity = ref(100);
    const progress = ref(0);
    const currentFileOrUrl = ref<any | null>(null);
    const geometry = ref<any | null>(null);
    const userParams = ref<any>(vtkURLExtract.extractURLParameters())
    const container = ref<any>();
    const geometryViewer = ref<Geometry | null>(null);
    const $c = useClientStore();
    const $q = useQuasar();
    const url_computed = computed(() => props.url);

    function progressCallback(progressEvent: any) {
        if (progressEvent.lengthComputable) {
          const percent = Math.floor((100 * progressEvent.loaded) / progressEvent.total);
          progress.value = percent;
        } else {
          progress.value = 0;
        }
    }
    function clear(ev) {
      geometryViewer.value.emptyContainer();
    }
    watch(url_computed, async (nv, ov) => {

      userParams.value.fileURL = nv;
      geometryViewer.value.setBackground(background.value);
      geometryViewer.value.load(userParams.value, progressCallback );

    });
    watch(currentFileOrUrl, (nv, ov)=> {

    });
    watch(localFile, (nv, ov) => {
      userParams.value.files = nv;
      geometryViewer.value.setBackground(background.value);
      geometryViewer.value.load(userParams.value, progressCallback );
    });
    watch(colorBy, (nv, ov) => {
      geometryViewer.value.updateColorBy(nv);
    });
    watch(component, (nv, ov) => {
      geometryViewer.value.updateColorByComponent(nv);
    });
    watch(background, (nv, ov) => {
      if (!geometryViewer.value) return;
      geometryViewer.value.setBackground(nv);
    });
    watch(representation, (nv, ov) => {
      geometryViewer.value.updateRepresentation(nv);
    });
    watch(colorPreset, (nv, ov)=> {
      geometryViewer.value.applyPreset(nv);
    });
    watch(opacity, (nv, ov) => {
      geometryViewer.value.updateOpacity(nv);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      container.value = await document.querySelector('div.vtk-content');
      geometryViewer.value = new Geometry(container.value,userParams.value);
    });
    onUnmounted(() => {
    });
    return {
      backgroundOptions,
      background,
      representation,
      colorPreset,
      geometryViewer,
      component,
      colorBy,
      opacity,
      progress,
      localFile,
      clear,
    }
  }
});

</script>
<style>
/*.vtk-content {
  height:400px;
  width:400px;
}*/
</style>