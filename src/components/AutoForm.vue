<template>
    <div class="q-pa-md noselect" v-if="parameters.val && template">
        <div v-for="param in template.parameters" :key="param.name">
          <template v-if="conditionCheck(parameters.val, param.if) && !param.hidden">
              <div :class="{ 'bg-white' : 'if' in param }" >
                    <template v-if="param.type === 'number'">
                      <div class="row">
                          <div class="col-12">
                            <q-input  dense :label="param.caption"  type="number" v-model="parameters.val[param.name]"/>
                          </div>
                      </div>
                    </template>
                    <template v-else-if="param.type === 'string'">
                      <div class="row">
                          <div class="col-12">
                            <q-input dense  :label="param.caption"  type="text" v-model="parameters.val[param.name]"/>
                          </div>
                      </div>
                    </template>
                    <template v-else-if="param.type === 'select'">
                      <div class="row">
                        <div class="col-12">
                           <q-select dense :label="param.caption" :options="param.candidates.map((x) => x.value)" v-model="parameters.val[param.name]"/>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="param.type === 'checkbox'">
                        <div class="col-12">
                           <q-checkbox v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                    </template>
                    <template v-else-if="param.type === 'component'">
                     <div class="row">
                        <div class="col-12">
                           <AutoForm v-model="parameters.val[param.name]" :template="param.components"/>
                        </div>
                      </div>                   
                    </template>
                    <template v-else-if="param.type === 'filepath-remote'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                      </div>                   
                    </template>
                    <template v-else>
                      <div class="row">
                          <div class="col-12">
                            <q-input dense :label="param.caption" type="text" v-model="parameters.val[param.name]"/>
                          </div>
                      </div>
                    </template>
              </div>
          </template>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, reactive} from 'vue';
import lodash from 'lodash';
import { conditionCheck } from 'src/utils';
import RemoteFileInput from 'src/components/RemoteFileInput.vue';

export default defineComponent({
  props: {
    modelValue: {
      type: Object,
      default: {}
    },
    template : {
      type: Object,
      default: {}
    } 
  },
  components: { 
    RemoteFileInput, 
  },
  setup (props, ctx) {
    const parameters = reactive<any>({val: null});

    watch(parameters, (nv, ov) => {
      ctx.emit('update:modelValue', nv.val);
      ctx.emit('changedParam', nv.val);
    });
    function onDev(ev) {
      console.log(parameters.val);
    }
    onMounted(async () => {
      console.log('Mounted');
      // const pairs = props.template.parameters.map((x) => ([x.name, x.value]));
      // parameters.val = lodash.fromPairs(pairs);     
      parameters.val = props.modelValue;
    });
    return {
      parameters,
      onDev,
      conditionCheck
    };
  }
});

</script>