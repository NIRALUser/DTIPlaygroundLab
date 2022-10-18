<template>
    <prism-editor class="module-editor" v-model="code" :highlight="highlighter" :line-numbers="lineNumbers"></prism-editor>
</template>

<script lang='ts'>
import { defineComponent, ref, onBeforeMount, onMounted, onUnmounted, watchEffect, computed, watch, reactive } from 'vue';

import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clojure';
import 'prismjs/themes/prism-tomorrow.css'; // import syntax highlighting styles

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    lang: {
      type: String,
      default: 'python',
    },
    lineNumbers: {
      type: Boolean,
      default: false,
    }
  },
  components: { 
                PrismEditor,
              },
  setup (props, ctx) {
    const root = ref<string>('/');
    const url = ref<string | null>(null);
    const code = ref<string | null>(null);
    const model_updated = computed(() => props.modelValue);

    function highlighter(code) {
      if (props.lang) return highlight(code, languages[props.lang]);
      else return code;
    }
    watch(model_updated, (nv,ov) =>{
      code.value = nv;
    });
    watch(code, (nv, ov)=> {
      ctx.emit('update:modelValue', code.value);
    });
    onBeforeMount(async () => {
    });
    onMounted(async () => {
      code.value = props.modelValue;
    });
    onUnmounted(() => {
    });
    return {
      highlighter,
      code,
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