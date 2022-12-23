<template>
  <div class="q-pa-auto content-body">
    <div class="q-pa-auto row">
      <div class="col-12">
        <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" ref="fileDialog"  v-model="selectedFile"/>
      </div>
      <template v-if="!loading">
          <div class="col-12" v-if="imageMeta">
             <q-expansion-item
                expand-icon-toggle
                icon="info"
                header-class="text-accent bg-grey-3"
                label="DWI Header"
                dense
              >
                    <q-item dense v-for="(v,k) in imageMeta.meta.info">
                      <q-item-section side>{{k}}</q-item-section>
                      <q-item-section>{{v}}</q-item-section>
                    </q-item>

              </q-expansion-item> 
             <q-expansion-item
                expand-icon-toggle
                icon="gradient"
                header-class="text-accent bg-grey-3"
                label="Gradients"
                dense
              >
                    <q-table
                      ref="gradTable"
                      class="noselect"
                      v-if="imageMeta"
                      :rows="imageMeta.meta.gradients"
                      row-key="index"
                      dense
                      :pagination = "pagination"
                      :columns="[{name:'index', align:'left', sortable: true, field:'index',label:'Index'},
                                 {name:'b_value', align:'left',sortable: true, field:'b_value', label:'B-Value'},
                                 {name:'gradient', align:'left', sortable: false, field:'gradient',label:'NRRD Gradient'},
                                 {name:'nifti_gradient', align:'left', sortable: false, field:'nifti_gradient',label:'NIFTI Gradient'},
                                 {name:'baseline', align:'left', sortable: true, field:'baseline',label:'Baseline'}
                      ]"
                    >
                      <template v-slot:body="props">
                        <q-tr :props="props" @click="slices.g = props.row.index;onGradientChanged($event)" :class="props.row.index === slices.g ? 'bg-primary text-white' : null">
                          <q-td key="index">
                            {{ props.row.index }}
                          </q-td> 
                          <q-td key="b_value">
                            {{ props.row.b_value.toFixed(1) }}
                          </q-td>
                          <q-td key="gradient">
                            {{ props.row.gradient.map((x) => parseFloat(x.toFixed(4))) }}
                          </q-td>
                          <q-td key="nifti_gradient" >
                            {{ props.row.nifti_gradient.map((x) => parseFloat(x.toFixed(4))) }}
                          </q-td>
                          <q-td key="baseline">
                            <q-icon name="checked" color="secondary" v-if="props.row.baseline"/>
                          </q-td>
                        </q-tr>
                      </template>
                    </q-table>
              </q-expansion-item> 

               <q-expansion-item
                  expand-icon-toggle
                  icon="image"
                  class="noselect"
                  header-class="text-accent bg-grey-3"
                  label="Image View"
                  dense
                  default-opened
                >            
                    <div class="row">
                      <q-item class="col-12">
                        <q-item-section side>
                          Range
                        </q-item-section>
                        <q-item-section>
                          <q-range v-model="threshold" :min="imageMeta.meta.info.display_range[0]" :max="imageMeta.meta.info.display_range[1]" label/>
                        </q-item-section>
                      </q-item>
                      <q-item class="col-12">
                        <q-item-section side>
                          Gradient Volume
                        </q-item-section>
                        <q-item-section>
                          <q-slider v-model="slices.g" :min="0" :max="imageMeta.meta.info.sizes[3]-1" label @update:model-value="onGradientChanged"/>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="row q-pa-none">
                      <div class="col-sm-4 col-xs-12 ">
                        <q-item>
                          <DWIViewerComponent title="Sagittal" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="0" :slice-index="slices.x" :gradient-index="slices.g" :threshold="threshold"/>
                        </q-item>
                        <q-item>
                          <q-item-section side>
                            Sagittal
                          </q-item-section>
                          <q-item-section>
                            <q-slider class="slider" :style="{'max-width': image_size.width - 70 + 'px'}" v-model="slices.x" :min="0" :max="imageMeta.meta.info.sizes[0]-1" label />
                          </q-item-section>
                        </q-item>
                      </div>
                      <div class="col-sm-4 col-xs-12   " >
                        <q-item>
                          <DWIViewerComponent title="Coronal" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="1" :slice-index="slices.y" :gradient-index="slices.g" :threshold="threshold"/>
                        </q-item>
                        <q-item>
                          <q-item-section side>
                            Coronal
                          </q-item-section >
                          <q-item-section  >
                            <q-slider class="slider" :style="{'max-width': image_size.width - 70 + 'px'}" v-model="slices.y" :min="0" :max="imageMeta.meta.info.sizes[1]-1" label />
                          </q-item-section>
                        </q-item>
                      </div>
                      <div class="col-sm-4 col-xs-12  ">
                        <q-item>
                          <DWIViewerComponent title="Axial" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="2" :slice-index="slices.z" :gradient-index="slices.g" :threshold="threshold"/>
                        </q-item>
                        <q-item>
                          <q-item-section side>
                            Axial
                          </q-item-section>
                          <q-item-section>
                            <q-slider class="slider" :style="{'max-width': image_size.width - 50 + 'px'}" v-model="slices.z" :min="0" :max="imageMeta.meta.info.sizes[2]-1" label />
                          </q-item-section>
                        </q-item>
                      </div>
                    </div>
                </q-expansion-item>
          </div>
      </template>
      <template v-else>
         <q-spinner-hourglass
            color="secondary"
            size="4em"
        />
      </template>
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
    // const threshold = ref<any>({min:0, max:10000})
    const { app, 
            root,
            slices,
            image_size,
            threshold,
            loading,
            imageMeta,
            pagination,      
            inProgress ,  
            isSuccessful, 
            selectedFile,
            isFailed } = storeToRefs($r);

    const currentFilename = ref<string>('_');
    const gradientIndex = ref<number|null>(0);
    const baseurl = ref<string|null>(null);
    const gradTable = ref(null);

    function onChangedDir(ev) {
      root.value = ev;
    }
    function onGradientChanged(ev) {
      threshold.value = {
        min: imageMeta.value.meta.info.volume_display_ranges[slices.value.g][0],
        max: imageMeta.value.meta.info.volume_display_ranges[slices.value.g][1],
      }
      const pageIndex = Math.floor(slices.value.g / pagination.value.rowsPerPage + 1);
      pagination.value.page = pageIndex;
      gradTable.value.setPagination(pagination.value);
    }
    watch(selectedFile, async (nv, ov) => {
      // console.log(nv);
      if(nv) {
        inProgress.value = true;
        const res = await $r.loadImageAsCache(nv);
        // console.log(res);
        imageMeta.value = res.data;
        // console.log(imageMeta.value);
        currentFilename.value = imageMeta.value.filename.replaceAll('/','_');
        
        inProgress.value = false;
        slices.value = {
          x:imageMeta.value.meta.info.image_size[0]/2,
          y:imageMeta.value.meta.info.image_size[1]/2,
          z:imageMeta.value.meta.info.image_size[2]/2,
          g:0,
        }
        threshold.value = {
          min: imageMeta.value.meta.info.volume_display_ranges[slices.value.g][0],
          max: imageMeta.value.meta.info.volume_display_ranges[slices.value.g][1],
        }
      }
    });

    onBeforeMount(async () => {
    });
    onMounted(async () => {
      const client = await $c.client;
      baseurl.value = await client.serverURL;
      // console.log(baseurl.value);
      if (baseurl.value ==='/') {
        baseurl.value = `http://${window.location.host}`;
      }
      // console.log(baseurl.value);
    });
    onUnmounted(() => {
    });
    return {
      root,
      selectedFile,
      fileDialog,
      imageMeta,
      threshold,
      gradientIndex,
      loading,
      slices,
      image_size,
      pagination,
      // slider 
      onGradientChanged,

      //
      onChangedDir,

      //env
      baseurl,

      //refs
      gradTable,
    }
  }
});

</script>
<style scoped>
.img {
  margin-right: 5px;
}
.slider {
/*  max-width: 240px;*/
}
</style>