<template>
  <div>
      <div class="bg-purple text-white">
        <template v-if="inProgress">
          <q-spinner-cube
            class="q-ma-xs"
            size="sm"
            :color="'black'"
          />
        </template>
        <template v-else>
          <template v-if="isSuccessful">
            <q-icon name="check_circle_outline" class="q-ma-xs"
              size="sm" color="primary"/>
          </template>
          <template v-else-if="isFailed">
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="hasRun ? 'red' : 'transparent'"/>
          </template>
          <template v-else>
            <q-icon name="highlight_off" class="q-ma-xs"
              size="sm" :color="'transparent'"/>
          </template>
        </template>
        <q-btn flat :disable="inProgress" @click="dumpParams">Dump Params</q-btn>
        <q-btn flat :disable="inProgress" @click="removeStorage">Remove Storage</q-btn>
      </div>
      <div>
        <q-tabs
          v-model="tab"
          inline-label
          class="bg-white text-primary shadow-2"
        >
              <q-tab name="editor" icon="code" ><div class="q-pa-sm text-bold gt-xs">Editor</div><q-tooltip>Editting module or general code</q-tooltip></q-tab> 
              <q-tab name="terminal" icon="terminal" ><div class="q-pa-sm text-bold gt-xs">Terminal</div><q-tooltip>Terminal to test the code</q-tooltip></q-tab> 

        </q-tabs>
      </div>
      <q-separator/>
      <div>
            <q-tab-panels v-model="tab" animated >
                  <q-tab-panel name="editor">
                     <prism-editor class="module-editor" v-model="code" :highlight="highlighter" line-numbers></prism-editor>
                  </q-tab-panel>
                  <q-tab-panel name="terminal">
                      <div> Terminal </div>
                  </q-tab-panel>
            </q-tab-panels>
      </div>
  </div>

</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';
import lodash from 'lodash';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useClientStore, useInterval,useGlobalNotification,  useGlobalVariables } from 'src/stores/dtiplayground';
import { useModuleEditor } from 'src/stores/moduleeditor';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles


export default defineComponent({
  components: { 
                PrismEditor
              },
  setup (props, ctx) {
    const $r = useModuleEditor();
    const tab = ref<string>('editor');
    const root = ref<string>('/');
    const url = ref<string | null>(null);
    const code = ref<string>(null);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app, 
            status,
            inProgress , 
            isSuccessful, 
            isFailed } = storeToRefs($r);

    function removeStorage(ev) {
      sessionStorage.clear()
    }
    function dumpParams(ev) {
    }
    function onChangedDir(ev) {
      root.value = ev;
    }
    function highlighter(code) {
      return highlight(code, languages.python);
    }
    watch(app, (nv, ov) => {
      console.log(app.value);
    });
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('moduleeditor-tab', tab.value);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      await $r.initialize();
      $g.setApplicationName('Editor');
    });
    onUnmounted(() => {
    });
    return {
      tab,
      dumpParams,
      onChangedDir,
      removeStorage,
      inProgress,
      isSuccessful,
      isFailed,
      code,
      highlighter
    }
  }
});

</script>
<style>
  /* required class */
  .module-editor {
    /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
    background: #2d2d2d;
/*    background: transparent;*/
    color: #ccc;

    /* you must provide font-family font-size line-height. Example: */
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 14px;
    line-height: 1.5;
    padding: 5px;
  }

.prism-editor__textarea:focus {
  outline: none;
}
</style>