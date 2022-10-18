<template>
      <div>
        <ConfirmDialog ref="confirmDialogDelete" v-model="confirmed"/>
        <RemoteFileSelectDialog :root="root" v-on:changed-dir="onChangedDir" ref="fileDialog" root="/" v-model="selectedFiles"/>
          <div class="row">
                <div><q-btn  :disable="disable"
                             color="primary" 
                             flat 
                             icon="content_paste"
                             @click="clearContent">
                         Clear</q-btn >
                         <q-tooltip>Clear current protocol pipeline</q-tooltip></div>
                <div><q-btn  
                            :disable="disable" 
                            color="primary" 
                            flat 
                            icon="folder_open"
                            @click="openFile">
                        Open
                    </q-btn ><q-tooltip>Open protocol file file in JSON format</q-tooltip></div>
                <div><q-btn  
                            color="primary" 
                            flat 
                            icon="download"
                            @click="downloadFile">
                        Download 
                </q-btn >
                <q-input ref="fileInput" style="display:none" v-model="localFile" type="file" label="Standard" ></q-input>
                <q-tooltip>Save protocol file in JSON format)</q-tooltip></div>
          </div>
          <q-separator/>
          <div>
            <q-splitter 
                v-model="splitterModel"
                >
                <template v-slot:before>
                  <div class="row">
                      <div class="col-6"> <!-- First Column -->
                           <div>
                             <q-list  padding class="module-list noselect">
                                 <q-item>
                                    <q-item-section>
                                        <q-item-label overline>SYSTEM MODULES</q-item-label>
                                        <q-item-label caption>Modules installed as default</q-item-label>
                                    </q-item-section>
                                 </q-item>
                                 <q-separator/>
                                 <q-item dense 
                                         clickable 
                                         :disable="disable"
                                         class="q-pa-auto col-12 text-bold text-primary" 
                                         v-for="m in app.modules.system" 
                                         :key="m.path"
                                         @dblclick="onDoubleClick(m.name)">
                                    <q-item-section>
                                        <q-item-label>{{ m.name }}</q-item-label>
                                        <q-tooltip>Double Click to Add this module</q-tooltip>
                                    </q-item-section>
                                 </q-item>
                             </q-list>
                           </div>
                           <div>
                             <q-list bordered padding class="noselect">
                                 <q-item>
                                    <q-item-section>
                                        <q-item-label overline>USER MODULES</q-item-label>
                                        <q-item-label caption>Custom user modules</q-item-label>
                                    </q-item-section>
                                 </q-item>
                                 <q-separator/>
                                 <q-item dense 
                                         clickable 
                                         :disable="disable"
                                         class="q-pa-auto col-12 text-bold text-primary" 
                                         v-for="m in app.modules.user" 
                                         :key="m.path"
                                         @dblclick="onDoubleClick(m.name)">
                                    <q-item-section>
                                        <q-item-label>{{ m.name }}</q-item-label>
                                        <q-tooltip>Double Click to Add this module</q-tooltip>
                                    </q-item-section>
                                 </q-item>
                             </q-list>
                            </div>
                      </div> <!-- First Column Ends-->
                      <div class="col-6"> <!-- Second Column -->
                           <div>
                             <q-list padding class="noselect">
                                 <q-item>
                                    <q-item-section>
                                        <q-item-label overline>PIPELINE</q-item-label>
                                        <q-item-label caption>Selected Modules in order of execution (top to bottom)</q-item-label>
                                    </q-item-section>
                                 </q-item>
                                 <q-separator/>
                                 <q-item dense 
                                         clickable 
                                         :class="{ 'q-pa-auto col-12 text-bold': true, 'bg-primary text-white' :currentIndex === i }" 
                                         @click="showProtocol(i)"
                                         v-for="m, i in pipeline"
                                         :key="`${i}-${m.id}`">
                                    <q-item-section>
                                        <q-item-label>{{ m.name }}</q-item-label>
          <!--                               <q-item-label caption> Test </q-item-label> -->
                                    </q-item-section>
                                    <template v-if="currentIndex === i && !disable">
                                         <q-item-section @click="moveUp(i)" side>
                                          <q-icon color="white" name="keyboard_arrow_up" />
                                         </q-item-section>
                                         <q-item-section @click="moveDown(i)" side >
                                          <q-icon clickable color="white" name="keyboard_arrow_down" />
                                         </q-item-section>
                                         <q-item-section @click="onDeleteModule(i)" side>
                                          <q-icon color="red" name="delete_outline" />
                                         </q-item-section>
                                     </template>
                                 </q-item>
                             </q-list>
                            </div>
                      </div> <!-- Second Column Ends-->
                  </div>
                </template>
                <template v-slot:after>
                  <div v-if="pipeline.length > 0">
                      <q-list padding>
                          <q-item class="q-pa-auto col-12">
                            <q-item-section>
                                <q-item-label overline>{{ pipeline[currentIndex].name }}</q-item-label>
                                <q-item-label caption>{{ pipeline[currentIndex].template.description }}</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-separator/>
                          <q-item-label overline>Protocol</q-item-label>
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir" :disable="disable" :key = "`${pipeline[currentIndex].id}-protocol`" v-model="pipeline[currentIndex].value.protocol" :template="pipeline[currentIndex].template.protocol" v-on:changed-param="onChanged"/>
                          <q-item-section><q-item-label overline>Execution option</q-item-label></q-item-section>
                          <AutoForm :root="root" v-on:changed-dir="onChangedDir"  :disable="disable" :key = "`${pipeline[currentIndex].id}-options`" v-model="pipeline[currentIndex].value.options" :template="pipeline[currentIndex].template.options"  v-on:changed-param="onChanged"/>
                      </q-list>
                  </div>
                </template>
            </q-splitter>
           </div>
      </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect, ref, reactive} from 'vue';
import { storeToRefs } from 'pinia';
import lodash from 'lodash';
import { download, getUUID, moveArrayElement } from 'src/utils';
import RemoteFileSelectDialog from 'src/components/RemoteFileSelectDialog.vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import AutoForm from 'src/components/AutoForm.vue';
import { useQuasar } from 'quasar';
import { useDMRIPrep } from 'src/stores/dmriprep';

export default defineComponent({
  props: {
    modelValue: {
      type: Array,
      default: []
    },
    hidden: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    root: {
      type: String,
      default: '/'
    }
  },
  components: {  
    AutoForm,
    RemoteFileSelectDialog,
    ConfirmDialog,
  },

  setup (props, ctx) {
    const splitterModel = ref(70);
    const $r = useDMRIPrep();
    const currentIndex = ref<number | null>(Number(sessionStorage.getItem('dmriprep-currentIndex') || null));
    const template = ref<any | null>(null);
    const confirmed = ref<boolean>(false);
    const localFile = ref<string | null>(null);
    const selectedFiles = ref<any[]>([]);
    const fileDialog = ref(null);
    const fileInput = ref(null);
    const confirmDialogDelete = ref(null);
    const { app, 
            pipeline,
            execution,
            inProgress , 
            isSuccessful, 
            logText, 
            progressMessage, 
            isFailed } = storeToRefs($r);

    async function openProtocolFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', async (ev) => {
        const data = JSON.parse(ev.target.result);
        await $r.setProtocols(data);
        localFile.value = null;
      });
      await reader.readAsText(file);
    }
   function clearContent(ev) {
        $r.clearProtocols();
        onChanged(ev);
    }

    function downloadFile(ev) {
      const protocols = pipeline.value.map((x) => ([x.name, x.value]));
      const output = {
        io : execution.value,
        pipeline: protocols
      }
      const outstr = JSON.stringify(output, null, 2);
      console.log(outstr);
      download("protocols.json",outstr);
    }

    function openFile(ev) {
        fileInput.value.$el.click();
    }
    function moveUp(idx) {
        if (idx === 0) return;
        const [ from, to ] = [ idx, idx - 1];
        const newarr = moveArrayElement(pipeline.value, from, to);
        pipeline.value = newarr;
        onChanged();
        currentIndex.value = currentIndex.value - 1;
    }
    function deleteModule(idx) {
        const new_pipeline = pipeline.value.filter((x,i) => i!==idx);
        pipeline.value = new_pipeline;
        currentIndex.value = Math.max(0,Math.min(pipeline.value.length - 1, currentIndex.value));
        onChanged();
    }
    function moveDown(idx) {
        if (idx === pipeline.value.length -1) return;
        const [ from, to ] = [ idx, idx + 1];
        
        const newarr = moveArrayElement(pipeline.value, from, to);
        pipeline.value = newarr;
        onChanged();
        currentIndex.value = currentIndex.value +1;
        
    }
    function onDeleteModule(ev) {
        confirmDialogDelete.value.openModal();
    }
    function onChanged(ev) {
        ctx.emit('changedParam', ev);
    }
    function onChangedDir(ev) {
        ctx.emit('changed-dir', ev);
    }
    watch(confirmed, (nv, ov) => {
        if(confirmed.value) {
            deleteModule(currentIndex.value);
        }
        confirmed.value = false;
    });
    watch(localFile, (nv, ov) => {
        if(!nv) return;
        openProtocolFile(nv[0])
    });
    async function onDoubleClick(name) {
        if (props.disable) return;
        const data = await $r.getTemplate(name);
        template.value = data;
        const protocol = $r.getDefaultValues(template.value.protocol);
        const options = $r.getDefaultValues(template.value.options);
        pipeline.value.push({ id: getUUID(), name, value: { options, protocol }, template : template.value });
        currentIndex.value = pipeline.value.length -1;
        onChanged();
    }
    watch(currentIndex, (nv, ov) => {
        sessionStorage.setItem('dmriprep-currentIndex',currentIndex.value);
    });
    async function showProtocol(idx) {
        currentIndex.value = idx;
    }
    onMounted(async () => {
    });
    return {
      splitterModel,
      app,
      pipeline,
      currentIndex,
      template,
      onDoubleClick,
      showProtocol,
      onChanged,
      clearContent,
      downloadFile,
      openFile,
      confirmed,
      localFile,
      selectedFiles,
      fileDialog,
      fileInput,
      moveUp,
      moveDown,
      deleteModule,
      onDeleteModule,
      confirmDialogDelete,
      onChangedDir
    };
  }
});

</script>
<style>
.module-list {
  border-left: 1px solid lightgray;
  border-right: 1px solid lightgray;
}
</style>