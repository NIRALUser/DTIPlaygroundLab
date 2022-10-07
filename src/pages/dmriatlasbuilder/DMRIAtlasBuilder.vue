<template>
  <q-btn @click="dumpParams">Dump Params</q-btn>
  <q-tabs
    v-model="tab"
    inline-label
    class="bg-black text-white shadow-2"
  >
        <q-tab name="hbuild" icon="movie" label="HBuild" />
        <q-tab name="affineatlas" icon="perm_media" label="Affine Atlas" />
        <q-tab name="diffeomorphicatlas" icon="perm_media" label="Diffeomorphic Atlas" />
        <q-tab name="finalresample" icon="view_sidebar" label="Final Resampling" />
        <q-tab name="execution" icon="settings" label="Execution" />
  </q-tabs>
  <q-separator />
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="hbuild">
      <HBuild v-model="inputs"/>
    </q-tab-panel>
    <q-tab-panel name="affineatlas">
      <AffineAtlas v-model="parameters.affine_atlas" :template="template.parameter_groups.affine_atlas"  v-on:changed-param="onParamChanged" />
    </q-tab-panel>
    <q-tab-panel name="diffeomorphicatlas">
      <DiffeomorphicAtlas v-model="parameters.diffeormorphic_atlas" :template="template.parameter_groups.diffeomorphic_atlas"  v-on:changed-param="onParamChanged" />
    </q-tab-panel>
    <q-tab-panel name="finalresample">
      <FinalResample v-model="parameters.final_resample" :template="template.parameter_groups.final_resample"  v-on:changed-param="onParamChanged"/>
    </q-tab-panel>
    <q-tab-panel name="execution">
      <Execution v-model="parameters.execution" :template="template.parameter_groups.execution"  v-on:changed-param="onParamChanged"/>
    </q-tab-panel>
  </q-tab-panels>

</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watchEffect, computed, watch } from 'vue';
import { useClientStore } from 'src/stores';
import lodash from 'lodash';
import AffineAtlas from './affineatlas/AffineAtlas.vue';
import DiffeomorphicAtlas from './diffeomorphicatlas/DiffeomorphicAtlas.vue';
import FinalResample from './finalresample/FinalResample.vue';
import Execution from './execution/Execution.vue';
import HBuild from './hbuild/HBuild.vue';

export default defineComponent({
  components: { 
                AffineAtlas,
                HBuild, 
                AffineAtlas,
                DiffeomorphicAtlas,
                FinalResample,
                Execution
              },
  setup (props, ctx) {
    const inputs = ref<any>({});
    const parameters = ref<any>({});
    const template = ref<any>();
    const tab = ref<any>("hbuild");
    const client_store = useClientStore();

    async function fileLoadTest() {
      const client = await client_store.getClient;
      const uri = `${ window.location.origin }/templates/dmriatlasbuilder.json`;
      const { data } = await client.axios.get(uri);
      // console.log(data);
      template.value = data;
      lodash.forIn(template.value.parameter_groups, (v, k) => {
        console.log(k);
        const pairs = v.parameters.map((x) => ([x.name, x.value]));
        parameters.value[k] = lodash.fromPairs(pairs);
      });
      console.log(parameters.value);
    }
    function onParamChanged(old_val) {
      console.log("Changed");
      console.log(parameters.value);
    }
    function dumpParams(ev) {
      console.log(parameters.value);
    }
    watchEffect(() => {
      console.log(parameters.value);
    });
    onMounted(async () => {
      await fileLoadTest();
    });
    return {
      inputs,
      template,
      parameters,
      tab,
      onParamChanged,
      dumpParams,
    }
  }
});

</script>