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
      <HBuild v-model="inputs" v-on:changed-param="onParamChanged"/>
    </q-tab-panel>
    <q-tab-panel name="affineatlas">
        <AutoForm v-model="parameters.affine_atlas" :template="template.parameter_groups.affine_atlas" v-on:change-params="onParamChanged"/>
    </q-tab-panel>
    <q-tab-panel name="diffeomorphicatlas">
        <AutoForm v-model="parameters.diffeomorphic_atlas" :template="template.parameter_groups.diffeomorphic_atlas" v-on:change-params="onParamChanged"/>
    </q-tab-panel>
    <q-tab-panel name="finalresample">
        <AutoForm v-model="parameters.final_resample" :template="template.parameter_groups.final_resample" v-on:change-params="onParamChanged"/>
    </q-tab-panel>
    <q-tab-panel name="execution">
        <AutoForm v-model="parameters.execution" :template="template.parameter_groups.execution" v-on:change-params="onParamChanged"/>
    </q-tab-panel>
  </q-tab-panels>

</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watchEffect, computed, watch, reactive } from 'vue';
import { useClientStore } from 'src/stores';
import lodash from 'lodash';
import HBuild from './hbuild/HBuild.vue';
import AutoForm from 'src/components/AutoForm.vue';

export default defineComponent({
  components: { 
                HBuild, 
                AutoForm
              },
  setup (props, ctx) {
    const inputs = ref<any[]>([]);
    const parameters = ref<any>({});
    const template = ref<any>();
    const tab = ref<any>("hbuild");
    const client_store = useClientStore();

    async function fileLoadTest() {
      const client = await client_store.getClient;
      const uri = `${ window.location.origin }/templates/dmriatlasbuilder.json`;
      const { data } = await client.axios.get(uri);
      template.value = data;
      lodash.forIn(template.value.parameter_groups, (v, k) => {
        const pairs = v.parameters.map((x) => ([x.name, x.value]));
        parameters.value[k] = lodash.fromPairs(pairs);
      });
    }
    function onParamChanged(val) {
      console.log("One of param, Changed");
      const data = {
        inputs: inputs.value,
        parameters: parameters.value
      };
    }
    function dumpParams(ev) {
      console.log(parameters.value);
    }

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