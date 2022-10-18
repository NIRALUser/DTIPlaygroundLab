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
                    <q-splitter 
                          v-model="splitter1"
                          vertical>
                       <template v-slot:before>
                          <div class="row">
                                      <div class="col-12">
                                               <q-scroll-area class="file-navigator-single" visible>
                                                 <div class="col-4">
                                                    <RemoteFileNavigator  :root="currentDir" singlecolumn v-on:open-file="onFileOpen" v-on:changed-dir="onChangedDir"/>
                                                 </div>
                                               </q-scroll-area>
                                       </div>
                          </div>
                        </template>
                        <template v-slot:after>
                           <q-splitter 
                                v-model="splitter2"
                                vertical
                                :limits="[1,99]">
                                <template v-slot:before>
                                  <div class="row">
                                               <div :class="'col-12'">
                                                      <q-scroll-area class="editor-single">
                                                         <div>
                                                           <code-editor v-model="currentCode" :lang="currentLanguage" />
                                                         </div>
                                                       </q-scroll-area>
                                                </div>
                                  </div>
                                </template>
                                <template v-slot:after >
                                  <div class="row" v-if="isMarkdown">
                                                <div  class="col-12 markdown-body">
                                                      <q-scroll-area class="editor-single">
                                                        <div>
                                                         <VueShowdown :markdown="currentCode" flavor="github"/>
                                                       </div>
                                                     </q-scroll-area>
                                                </div>
                                   </div>
                                 </template>
                            </q-splitter>
                         </template>
                     </q-splitter>
                  </q-tab-panel>
                  <q-tab-panel name="terminal">
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
import CodeEditor  from 'src/components/CodeEditor.vue';
import RemoteFileNavigator from 'src/components/RemoteFileNavigator.vue';
import "github-markdown-css";

export default defineComponent({
  components: { 
                CodeEditor,
                RemoteFileNavigator,
              },
  setup (props, ctx) {
    const $r = useModuleEditor();
    const tab = ref<string>('editor');
    const url = ref<string | null>(null);
    const commands = ref<any[]>([]);
    const $c = useClientStore();
    const $q = useQuasar();
    const $i = useInterval();
    const $n = useGlobalNotification();
    const $g = useGlobalVariables();
    const { app, 
            status,
            splitter1,
            splitter2,
            inProgress,
            currentDir,
            currentCode,
            isMarkdown,
            currentLanguage,
            isSuccessful, 
            isFailed } = storeToRefs($r);

    function removeStorage(ev) {
      sessionStorage.clear()
    }
    function dumpParams(ev) {
    }
    function onChangedDir(ev) {
      currentDir.value = ev;
    }
    async function onFileOpen(filename) {
      console.log(filename);
      const client = await $c.client;
      try {
        const { data } = await client.getTextWholeFile(filename);
        currentLanguage.value = 'markup';
        isMarkdown.value = false;
        if (filename.endsWith('.json')) currentLanguage.value = 'json';
        if (filename.endsWith('.py')) currentLanguage.value = 'python';
        if (filename.endsWith('.js')) currentLanguage.value = 'js';
        if (filename.endsWith('.ts')) currentLanguage.value = 'ts';
        if (filename.endsWith('.sh')) currentLanguage.value = 'bash';
        if (filename.endsWith('.html') || filename.endsWith('.xml') || filename.endsWith('.md')) currentLanguage.value = 'markup';
        if (filename.endsWith('.c') || filename.endsWith('.cpp') || filename.endsWith('.h') || filename.endsWith('.hpp')) currentLanguage.value = 'clike';
        if (filename.endsWith('.yml') || filename.endsWith('.yaml')) currentLanguage.value = 'yaml'
        if (filename.endsWith('.md')) isMarkdown.value = true;
        currentCode.value = data;        
      } catch(e) {
        $n.notify({message: 'Failed to load the text file', color:'red', timeout:1000});
      }
    }
    watch(isMarkdown, (nv, ov) => {
      if(nv) {
        splitter2.value = 50;
      } else {
        splitter2.value = 99;
      }
    });
    watch(splitter2, (nv) => {
    });
    watch(currentDir, (nv, ov) => {
    });
    watch(app, (nv, ov) => {
      console.log(app.value);
    });
    watch(tab, (nv, ov) => {
      sessionStorage.setItem('moduleeditor-tab', tab.value);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      await $g.initialize()
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
      commands,
      onFileOpen,
      currentCode,
      currentDir,
      currentLanguage,
      isMarkdown,
      splitter1,
      splitter2,
    }
  }
});

</script>
<style>
.file-navigator-single {
  font-size: 0.9em;
  padding: 10px;
  padding-left: 0px;
  border: 1px solid lightgray;
  border-right: none;
/*  width: 30vh;*/
  height: 80vh;
}
.editor-single {
  font-size: 0.8em;
  padding: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 10px;
  border: 1px solid lightgray;
  border-left: none;
  border-right: none;
/*  width: 30vh;*/
  height: 80vh;
}
</style>