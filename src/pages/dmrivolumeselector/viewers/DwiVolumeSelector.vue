<template>
  <div class="q-pa-auto content-body">
    <div class="q-pa-auto row">
      <div class="col-12">
        <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" ref="fileDialog"  v-model="selectedFile"/>
      </div>
      <template v-if="!loading">
          <div class="col-12" v-if="imageMeta">
          <q-dialog v-model="prep_dialog" persistent :loading="prepProgress" >           
            <q-card id="small_prep" style="width: 34vw" :loading="!prepProgress">
              <q-card-section>
                <div class="text-h6" style="text-align: center;">Run DMRIPrep</div>
              </q-card-section>
              <q-card-section>
                <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" ref="fileDialog" directory v-model="output_path" label="Output Directory"/>
              </q-card-section>
              <q-card-actions style="width:50%; float:left;">
                <template v-if="prepProgress">
                  <q-spinner-cube
                    size="md"
                    color="primary"
                  />
                </template>
                <template v-if="prepSuccessful">
                  <q-icon name="check_circle_outline"
                    size="md" color="green">
                    <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                      <strong>Prep was Succesful</strong>
                    </q-tooltip>
                  </q-icon>
                </template>
                <template v-else-if="prepFailed">
                  <q-icon name="highlight_off"
                    size="md" color="red">
                    <q-tooltip anchor="center right" self="center left" :offset="[10, 10]">
                      <strong>Prep failed</strong>
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-card-actions>
              <q-card-actions style="width:50%; float:right;">
                <q-btn align="right" :loading="prepSuccessful" :disable="prepProgress" flat label="Close" color="red" v-close-popup @click="closePrep"></q-btn>
                <q-btn align="right" :loading="prepSuccessful" :disable="prepProgress || output_path_temp.length < 1" flat label="Execute" color="green" @click="execute"></q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
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
                        <q-tr :props="props">
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
         
              <div class="row q-pa-none">
                <div class="col-sm-10 col-xs-12 ">
                  <q-item v-if="sag_check">
                    <DWIVolumeSelectorComponent title="Sagittal" @selected="updateSelected"  :selected_images="selected_images" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="0" :slice-index="slices.x" :num_col="num_col"/>
                  </q-item>
                  <q-item v-if="cor_check">
                    <DWIVolumeSelectorComponent title="Coronal" @selected="updateSelected" :selected_images="selected_images" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="1" :slice-index="slices.y" :num_col="num_col"/>
                  </q-item>
                  <q-item v-if="axi_check">
                    <DWIVolumeSelectorComponent title="Axial" @selected="updateSelected" :selected_images="selected_images" :image-meta="imageMeta" :width="image_size.width" :height="image_size.height" :base-url="`${baseurl}/api/v1/dwi`" :axis-index="2" :slice-index="slices.z" :num_col="num_col"/>
                  </q-item>
                </div>
                <div class="col-sm-2 col-xs-12 ">
                  <q-item>
                    <q-item-section>
                      <q-checkbox v-model="sag_check" label="Sagittal" @update:model-value="updateSag"/>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-checkbox v-model="cor_check" label="Coronal" @update:model-value="updateCor"/>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-checkbox v-model="axi_check" label="Axial" @update:model-value="updateAxi"/>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-slider class="slider" v-model="slide_value" :min="0" :max="imageMeta.meta.info.sizes[current_slice]-1" @change="updateSlice" label />
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-input
                      v-model.number="slice_index"
                      type="number"
                      label="Slice"
                      :rules="[val => val < imageMeta.meta.info.sizes[current_slice] || `Max Value of ${imageMeta.meta.info.sizes[current_slice]}`]"
                    ></q-input>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-input
                      v-model.number="num_col"
                      type="number"
                      label="Number of Columns"
                      :rules="[val => val < 10 || 'Max Value of 10']"
                      hint="Max Value of 10"
                    ></q-input>
                  </q-item>
                  <q-item>
                    <q-input
                    type="textarea"
                    disable
                    v-model="selected_str"
                    label="Selected Gradients"
                    ></q-input>
                  </q-item>
                  <q-item>
                    <q-btn
                    color="primary"
                    size="13px"
                    label="Copy Gradients"
                    dense
                    @click="copyToClipBoard"
                    >
                    </q-btn>
                  </q-item>
                  <q-item>
                    <q-btn
                    color="primary"
                    size="13px"
                    label="Run DMRI Prep"
                    dense
                    @click="prepDialog"
                    >
                    </q-btn>
                  </q-item>
                </div>
              </div>
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
import { useDMRIVolumeSelector_DWIVolumeSelector } from 'src/stores/dmrivolumeselector';
import RemoteFileInput from 'src/components/RemoteFileInput.vue';
import DWIVolumeSelectorComponent from 'src/components/DWIVolumeSelectorComponent.vue';
import { useDMRIPrep } from 'src/stores/dmriprep';


export default defineComponent({
  props: {
  },
  components: { 
                RemoteFileInput,
                DWIVolumeSelectorComponent,
              },
  setup (props, ctx) {
    // const root = ref<string>('/');
    const progress = ref(0);
    const $c = useClientStore();
    const $q = useQuasar();
    const $r = useDMRIVolumeSelector_DWIVolumeSelector();
    const $p = useDMRIPrep();
    const fileDialog = ref(null);
    const range_holder = ref<any>({min:0, max:10000});
    const { root,
            slices,
            image_size,
            loading,
            imageMeta,
            pagination,      
            inProgress,  
            selectedFile } = storeToRefs($r);

    const { pipeline,
            execution,
            inProgress : prepProgress, 
            isSuccessful : prepSuccessful,
            execution_command, 
            isFailed : prepFailed } = storeToRefs($p);

    const currentFilename = ref<string>('_');
    const gradientIndex = ref<number|null>(0);
    const baseurl = ref<string|null>(null);
    const gradTable = ref(null);
    const sag_check = ref<boolean>(true);
    const cor_check = ref<boolean>(false);
    const axi_check = ref<boolean>(false);
    const num_col = ref<number>(5);
    const slice_index = ref<number>(0);
    const slide_value = ref<number>(0);
    const current_slice = ref<number>(0);
    const selected_str = ref<string>('');
    const selected_images = ref<any>([]);
    const prep_dialog = ref<boolean>(false);
    const output_path = ref<string>('');
    const output_path_temp = ref<string>('');
    const prep_pipeline = [{ 
      name: 'MANUAL_Exclude', 
      value: { 
        options: {
          overwrite: false,
          skip: false,
          write_image: false,
        },
        protocol: {
          gradientsToExclude: '',
        }
      }
    
    }];
    const execution_prep = {
      baseline_threshold: 10,
      input_image_1: '',
      input_image_2: null,
      no_output_image: false,
      num_threads: 1,
      output_directory: '',
      output_filename_base: null,
      output_format: null,
    }

    function onChangedDir(ev) {
      root.value = ev;
    }
    function updateSelected(ev) {
      const copy_selected = selected_images.value;
      const image = document.getElementById(`image_${ev.toString()}`);
      const image_parent = image?.parentElement;
      if (selected_images.value.includes(ev)) {
        const index = selected_images.value.indexOf(ev);
        copy_selected.splice(index, 1);
      } else {
        copy_selected.push(ev);
      }
      copy_selected.sort((a, b) => a - b);
      selected_images.value = copy_selected
      selected_str.value = selected_images.value.toString();
    }
    function updateSag(ev) {
      if (ev) {
        current_slice.value = 0;
        slice_index.value = slices.value.x;
        cor_check.value = false;
        axi_check.value = false;
      }
    }
    function updateCor(ev) {
      if (ev) {
        current_slice.value = 1;
        slice_index.value = slices.value.y;
        sag_check.value = false;
        axi_check.value = false;
      }
    }
    function updateAxi(ev) {
      if (ev) {
        current_slice.value = 2;
        slice_index.value = slices.value.z;
        sag_check.value = false;
        cor_check.value = false;
      }
    }
    function updateSlice(ev) {
      slice_index.value = ev;
    }
    function copyToClipBoard(ev) {
      navigator.clipboard.writeText(selected_str.value);
    }
    async function closePrep(ev) {
      $p.reset();
    }
    async function prepDialog(ev) {
      prep_dialog.value = true;
    }

    async function execute(ev) {
      prep_pipeline[0].value.protocol.gradientsToExclude = selected_str.value;
      pipeline.value = prep_pipeline;
      execution.value.output_directory = output_path.value
      execution.value.input_image_1 = selectedFile.value;
      await $p.execute();
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
        slice_index.value = imageMeta.value.meta.info.image_size[0]/2;
        selected_images.value = []
        selected_str.value = '';
      }
    });
    watch(output_path, async (nv, ov) => {
      output_path_temp.value = nv;
      if (!nv) {
        output_path_temp.value = '';
      }
    });
    watch(slice_index, async (nv, ov) => {
      slide_value.value = nv;
      if (current_slice.value === 0) slices.value.x = nv;
      if (current_slice.value === 1) slices.value.y = nv;
      if (current_slice.value === 2) slices.value.z = nv;        
    });
    watch(selected_images, async (nv, ov) => {
      console.log(nv);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      const client = await $c.client;
      await $p.initialize();
      execution.value = execution_prep;
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
      gradientIndex,
      loading,
      slices,
      image_size,
      pagination,
      sag_check,
      cor_check,
      axi_check,
      num_col,
      slice_index,
      current_slice,
      slide_value,
      selected_images,
      selected_str,
      range_holder,
      
      // slider 
      updateSlice,

      //
      onChangedDir,
      updateSelected,
      copyToClipBoard,
      

      //dmriprep
      execute,
      prepDialog,
      closePrep,
      prep_dialog,
      output_path,
      output_path_temp,
      prep_pipeline,
      execution_command,
      prepProgress,
      prepSuccessful,
      prepFailed,
      
      //env
      baseurl,

      //refs
      gradTable,

      //checkbox
      updateSag,
      updateCor,
      updateAxi,
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