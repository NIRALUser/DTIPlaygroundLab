<template>
    <div class="q-pa-md noselect" v-if="parameters.val && template">
        <div v-for="param in template" :key="param.name">
          <template v-if="conditionCheck(parameters.val, param.if) && !param.hidden">
              <div :class="{ 'bg-white' : 'if' in param }" >
                    <template v-if="paramType(param.type) === 'number'">
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled"  dense :label="param.caption"  type="number" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip>
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
                    <template :disable="disable" v-else-if="param.type === 'string'">
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled" dense  :label="param.caption"  type="text" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip>
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'select'">
                      <div class="row">
                        <div class="col-12">
                           <q-select :disable="disable || param.disabled" dense :label="param.caption" :options="param.candidates.map((x) => x.value)"  v-model="parameters.val[param.name]">
                            </q-select>
                        </div>
                        <q-tooltip>
                            {{ param.description }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template  v-else-if="paramType(param.type) === 'boolean'">
                        <div class="col-12">
                           <q-checkbox :disable="disable || param.disabled" v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                        <q-tooltip>
                            {{ param.description }}
                        </q-tooltip>
                    </template>
                    <template v-else-if="paramType(param.type) === 'component'">
                     <div class="row">
                        <div class="col-12">
                           <AutoForm :disable="disable || param.disabled" v-model="parameters.val[param.name]" :template="param.components"/>
                        </div>
                      </div>                   
                    </template>
                    <template v-else-if="paramType(param.type) === 'filepath-remote'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput :disable="disable || param.disabled" v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                        <q-tooltip>
                            {{ param.description }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'dirpath-remote'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput :disable="disable || param.disabled" v-model="parameters.val[param.name]" directory :label="param.caption"/>
                        </div>
                        <q-tooltip>
                            {{ param.description }}
                        </q-tooltip>
                    </div>                       
                    </template>
                    <template v-else>
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled" dense :label="param.caption" type="text" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip>
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
              </div>
          </template>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, reactive, computed} from 'vue';
import lodash from 'lodash';
import { conditionCheck } from 'src/utils';
import RemoteFileInput from 'src/components/RemoteFileInput.vue';

function paramType(from): string {
  const typemap = {
    'number' : 'number',
    'float' : 'number',
    'integer' : 'number',
    'string' : 'string',
    'list' : 'select',
    'select':'select',
    'boolean':'boolean',
    'filepath-remote':'filepath-remote',
    'dirpath-remote':'dirpath-remote',
    'component':'component',
    'checkbox':'boolean'
  }
  return typemap[from];
}
export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: {}
    },
    template : {
      type: Object,
      default: {}
    },
    disable : {
      type: Boolean,
      default: false
    }
  },
  components: { 
    RemoteFileInput, 
  },
  setup (props, ctx) {
    const parameters = reactive<any>({val: null});
    const currentTemplate = computed(() => props.template)
    watch(parameters, (nv, ov) => {
      ctx.emit('update:modelValue', nv.val);
      ctx.emit('changedParam', nv.val);
    });
    function onDev(ev) {
      console.log(parameters.val);
    }
    watch(currentTemplate, (nv, ov) => {
      parameters.val = props.modelValue;
    });
    onMounted(async () => {  
      parameters.val = props.modelValue;
    });
    return {
      parameters,
      onDev,
      conditionCheck,
      paramType,

    };
  }
});

</script>