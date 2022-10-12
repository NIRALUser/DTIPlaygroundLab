<template>
      <div>
          <div class="row">
                <div><q-btn  :disable="disable" color="primary" flat icon="content_paste">Clear Protocols</q-btn ><q-tooltip>Clear current protocol pipeline</q-tooltip></div>
                <div><q-btn  :disable="disable" color="primary" flat icon="folder_open">Open Protocols</q-btn ><q-tooltip>Open protocol file file in JSON format</q-tooltip></div>
                <div><q-btn  color="primary" flat icon="download">Download Protocols</q-btn ><q-tooltip>Save protocol file in JSON format)</q-tooltip></div>
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
                             <q-list bordered padding class="noselect">
                                 <q-item>
                                    <q-item-section>
                                        <q-item-label overline>SYSTEM MODULES</q-item-label>
                                        <q-item-label caption>Modules installed as default</q-item-label>
                                    </q-item-section>
                                 </q-item>
                                 <q-separator/>
                                 <q-item dense 
                                         clickable 
                                         class="q-pa-auto col-12 text-bold text-primary" 
                                         v-for="m in app.modules.system" 
                                         :key="m.path"
                                         @dblclick="onDoubleClick(m.name)">
                                    <q-item-section>
                                        <q-item-label>{{ m.name }}</q-item-label>
             <!--                            <q-item-label caption> Test </q-item-label> -->
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
                                         class="q-pa-auto col-12 text-bold text-primary" 
                                         v-for="m in app.modules.user" 
                                         :key="m.path"
                                         @dblclick="onDoubleClick(m.name)">
                                    <q-item-section>
                                        <q-item-label>{{ m.name }}</q-item-label>
           <!--                              <q-item-label caption> Test </q-item-label> -->
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
                                         :class="{ 'q-pa-auto col-12 text-bold': true, 'bg-primary text-white' :currentIndex ===i }" 
                                         @click="showProtocol(i)"
                                         v-for="m, i in pipeline"
                                         :key="`${i}-${m[0]}`">
                                    <q-item-section>
                                        <q-item-label>{{ m[0] }}</q-item-label>
          <!--                               <q-item-label caption> Test </q-item-label> -->
                                    </q-item-section>
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
                                <q-item-label overline>{{ pipeline[currentIndex][0] }}</q-item-label>
                                <q-item-label caption>{{ pipeline[currentIndex][2].description }}</q-item-label>
                            </q-item-section>
                          </q-item>
                          <q-separator/>
                          <AutoForm v-model="pipeline[currentIndex][1].protocol" :template="pipeline[currentIndex][2].protocol" v-on:changed-param="onChanged"/>
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
import { download, getUUID } from 'src/utils';
import RemoteFileSelectDialog from 'src/components/RemoteFileSelectDialog.vue';
import PromptDialog from 'src/components/PromptDialog.vue';
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
    }
  },
  components: {  
    AutoForm,
  },

  setup (props, ctx) {
    const splitterModel = ref(70);
    const $r = useDMRIPrep();
    const currentIndex = ref<number>(0);
    const template = ref<any | null>(null);
    const { app, 
            pipeline,
            options,
            inProgress , 
            isSuccessful, 
            logText, 
            progressMessage, 
            isFailed } = storeToRefs($r);

    function onChanged(ev) {
        ctx.emit('changedParam', ev);
    }
    async function onDoubleClick(name) {
        const data = await $r.getTemplate(name);
        template.value = data;
        const pairs = template.value.protocol.map((x) => ([x.name, x.default_value]));
        const defvals = lodash.fromPairs(pairs);
        pipeline.value.push([name, { options: null, protocol: defvals }, template.value])
        currentIndex.value = pipeline.value.length -1;
    }
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
    };
  }
});

</script>