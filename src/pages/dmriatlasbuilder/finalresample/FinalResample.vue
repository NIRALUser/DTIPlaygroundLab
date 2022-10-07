<template>
  <main>
    <div class="q-pa-md noselect" v-if="parameters">
      <p> DMRI AtlasBuilder Parameters </p>
      <q-btn color="primary" @click="onDev">Show params</q-btn>
        <div v-for="param in template.parameters" :key="param.name">
          <template v-if="param.type === 'number'">
            <div class="row">
                <div class="col-12">
                  <q-input dense @update:modelValue="onChanged($event)" :label="param.caption"  type="number" v-model="parameters[param.name]"/>
                </div>
            </div>
          </template>
          <template v-else-if="param.type === 'string'">
            <div class="row">
                <div class="col-12">
                  <q-input dense @update:modelValue="onChanged($event)" :label="param.caption"  type="text" v-model="parameters[param.name]"/>
                </div>
            </div>
          </template>
          <template v-else-if="param.type === 'select'">
            <div class="row">
              <div class="col-12">
                 <q-select dense @update:modelValue="onChanged($event)" :label="param.caption" :options="param.candidates.map((x) => x.value)" v-model="parameters[param.name]"/>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="row">
                <div class="col-12">
                  <q-input dense @update:modelValue="onChanged($event)" :label="param.caption" type="text" v-model="parameters[param.name]"/>
                </div>
            </div>
          </template>
        </div>
    </div>
  </main>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect, ref} from 'vue';
import { useClientStore } from 'src/stores';
import lodash from 'lodash';

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
  },
  setup (props, ctx) {
    const client_store = useClientStore();
    const parameters = ref<any | null>(null);

    function onChanged(ev) {
      ctx.emit('update:modelValue', parameters.value);
      ctx.emit('changedParam', parameters.value);
    }
    function onDev(ev) {
      console.log(parameters);
    }
    onMounted(async () => {
      const pairs = props.template.parameters.map((x) => ([x.name, x.value]));
      parameters.value = lodash.fromPairs(pairs);
      onChanged();
    });
    return {
      parameters,
      onChanged,
      onDev,
    };
  }
});

</script>