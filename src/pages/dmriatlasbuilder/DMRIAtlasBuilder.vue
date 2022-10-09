<template>
  <q-tabs
    v-model="tab"
    inline-label
    class="bg-black text-white shadow-2"
  >
        <q-tab name="main" icon="home"><div class="q-pa-sm text-bold gt-sm">DMRI Atlas Builder</div><q-tooltip>DMRI Atlas Builder Home</q-tooltip></q-tab>
        <q-tab name="hbuild" icon="account_tree"><div class="q-pa-sm text-bold gt-sm">HBuild</div><q-tooltip>HBuild Tree</q-tooltip></q-tab>
        <q-tab name="affineatlas" icon="transform"><div class="q-pa-sm text-bold gt-sm">Affine Atlas</div><q-tooltip>Affine Atlas Parameters</q-tooltip></q-tab>
        <q-tab name="diffeomorphicatlas" icon="polyline"><div class="q-pa-sm text-bold gt-sm">Diffeomorphic Atlas</div><q-tooltip>Diffeomorphic Atlas Parameters</q-tooltip></q-tab> 
        <q-tab name="finalresample" icon="loop" ><div class="q-pa-sm text-bold gt-sm">Final Resampling</div><q-tooltip>Resampling Parameters</q-tooltip></q-tab> 
        <q-tab name="execution" icon="directions_run" ><div class="q-pa-sm text-bold gt-sm">Execution</div><q-tooltip>Execution variables & command</q-tooltip></q-tab> 
  </q-tabs>
  <q-btn @click="dumpParams">Dump Params</q-btn>
  <q-separator />
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="main">
      <DMRIAtlasBuilderHome />
    </q-tab-panel>
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
        <q-btn color="primary" @click="execute">Execute</q-btn>
    </q-tab-panel>
  </q-tab-panels>

</template>

<script lang='ts'>

import { defineComponent, ref, onMounted, watchEffect, computed, watch, reactive } from 'vue';
import { useClientStore, useNotificationStore } from 'src/stores';
import lodash from 'lodash';
import HBuild from './hbuild/HBuild.vue';
import AutoForm from 'src/components/AutoForm.vue';
import DMRIAtlasBuilderHome from './intro/DMRIAtlasBuilderHome.vue';
import { hbuildFromQtree } from './hbuild/treeconvert';
import { useQuasar } from 'quasar';
import { convertABParameters } from './convert';

export default defineComponent({
  components: { 
                HBuild, 
                AutoForm,
                DMRIAtlasBuilderHome
              },
  setup (props, ctx) {
    const inputs = ref<any[]>([]);
    const parameters = ref<any>({});
    const template = ref<any>();
    const tab = ref<any>("hbuild");
    const client_store = useClientStore();
    const $q = useQuasar();

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
      console.log(inputs.value);
      console.log(parameters.value);
    }

    async function execute(ev) {
      if (!inputs.value || !parameters.value || inputs.value.length < 1) {
        $q.notify({message: 'Parameters are not ready', timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
        return;
      }
      const client = await client_store.getClient;
      const payload = {
        output_dir: '/mnt/niral/Zylka/DTI/tests-dmriatlasbuilder/tests/20221008-server-test-3',
        hbuild: hbuildFromQtree(inputs.value[0]),
        config: convertABParameters(parameters.value),
        greedy: {},
      };

      try {
        const data = await client.DMRIAtlasbuilder_generateOutputDirectory(payload);
      } catch (e) {
        $q.notify({message: e.response.data.msg, timeout: 20000, color : 'red', actions: [{icon: 'close'}]});
      }

    }
    onMounted(async () => {
        await fileLoadTest();
        $q.notify({ message : "Hello world", color: "green", timeout: 1000});
    });
    return {
      inputs,
      template,
      parameters,
      tab,
      onParamChanged,
      dumpParams,
      execute,
    }
  }
});

</script>