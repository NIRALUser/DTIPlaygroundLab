<template>
  <div class="q-pa-auto content-body">
    <div class="q-pa-auto row">
      <div class="col-12">
        <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" ref="fileDialog"  v-model="selectedFile"/>
      </div>
      <div class="col-12" v-if="imageMeta">
        <div class="row">
          <q-item class="col-12">
            <q-item-section side>
              Range
            </q-item-section>
            <q-item-section>
              <q-range v-model="threshold" :min="0" :max="10000" label/>
            </q-item-section>
          </q-item>
          <q-item class="col-12">
            <q-item-section side>
              Gradient Volume
            </q-item-section>
            <q-item-section>
              <q-slider v-model="gradientIndex" :min="0" :max="imageMeta.meta.info.sizes[3]-1" label/>
            </q-item-section>
          </q-item>
        </div>
        <div class="row">
          <div class="col img">
            <DWIViewerComponent :image-meta="imageMeta" base-url="http://localhost:6543/api/v1/dwi" :axis-index="0" :gradient-index="gradientIndex" :threshold="threshold"/>
          </div>
          <div class="col  img">
            <DWIViewerComponent :image-meta="imageMeta" base-url="http://localhost:6543/api/v1/dwi" :axis-index="1" :gradient-index="gradientIndex" :threshold="threshold"/>
          </div>
          <div class="col  img">
            <DWIViewerComponent :image-meta="imageMeta" base-url="http://localhost:6543/api/v1/dwi" :axis-index="2" :gradient-index="gradientIndex" :threshold="threshold"/>
          </div>
        </div>
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

import { useDMRIViewer_TractViewer, useDMRIViewer_DWIViewer } from 'src/stores/dmriviewer';
import RemoteFileInput from 'src/components/RemoteFileInput.vue';
import DWIViewerComponent from 'src/components/DWIViewerComponent.vue';


export default defineComponent({
  props: {
  },
  components: { 
                RemoteFileInput,
                DWIViewerComponent,
              },
  setup (props, ctx) {
    // const root = ref<string>('/');
    const progress = ref(0);
    const $c = useClientStore();
    const $q = useQuasar();
    const $r = useDMRIViewer_DWIViewer();
    const fileDialog = ref(null);
    const threshold = ref<any>({min:0, max:10000})
    const { app, 
            root,
            imageMeta,
            navigation,        
            inProgress ,  
            isSuccessful, 
            selectedFile,
            isFailed } = storeToRefs($r);

    const imageUrl = reactive<any>({x:null,y:null,z:null});
    const currentFilename = ref<string>('_');
    const gradientIndex = ref<number|null>(0);
    function onChangedDir(ev) {
      root.value = ev;
    }
    watch(selectedFile, async (nv, ov) => {
      console.log(nv);
      if(nv) {
        inProgress.value = true;
        const res = await $r.loadImageAsCache(nv);
        console.log(res);
        imageMeta.value = res.data;
        console.log(imageMeta.value);
        currentFilename.value = imageMeta.value.filename.replaceAll('/','_');
        
        inProgress.value = false;
        navigation.value.currentGradient = 0;
        navigation.value.currentAxis = 0;
        navigation.value.currentIndex = 0;
      }
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
    });
    onUnmounted(() => {
    });
    return {
      root,
      selectedFile,
      fileDialog,
      navigation,
      imageMeta,
      threshold,
      gradientIndex,

      //
      onChangedDir,
    }
  }
});

</script>
<style scoped>
.img {
  margin-right: 5px;
}
</style>