<template>
    <div class="q-pa-md noselect" v-if="parameters.val && template">
        <div v-for="param in template" :key="param.name">
          <template v-if="conditionCheck(parameters.val, param.if) && !param.hidden">
              <div :class="{ 'bg-white' : 'if' in param }" >
                    <template v-if="paramType(param.type) === 'number'">
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)"  dense :label="param.caption"  type="number" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip v-if="param.description">
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
                    <template :disable="disable" v-else-if="paramType(param.type) === 'string'">
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" dense  :label="param.caption"  type="text" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip v-if="param.description">
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
                    <template :disable="disable" v-else-if="paramType(param.type) === 'array'">
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" dense  :label="param.caption"  type="text" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip v-if="param.description">
                            {{ param.description }}
                          </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'select'">
                      <div class="row">
                        <div class="col-12">
                           <q-select :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" map-options emit-value option-label="caption" dense :label="param.caption" :options="filterCanidates(parameters.val, param.candidates)"  v-model="parameters.val[param.name]">
                                    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                                      <q-item v-bind="itemProps">
                                        <q-item-section>
                                          <q-item-label v-html="opt.caption" />
                                        </q-item-section>
                                        <q-tooltip>{{opt.description}}</q-tooltip>
                                      </q-item>
                                    </template>
                            </q-select>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template  v-else-if="paramType(param.type) === 'boolean'">
                        <div class="col-12">
                           <q-checkbox :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                    </template>
                    <template v-else-if="paramType(param.type) === 'component'">
                     <div class="row">
                        <div class="col-12">
                           <AutoForm :disable="disable || param.disabled " v-model="parameters.val[param.name]" :template="param.components"/>
                        </div>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'filepath-remote'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" v-model="parameters.val[param.name]" :label="param.caption"/>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'filepath-remote-mult'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" v-model="parameters.val[param.name]" :label="param.caption" :multiple="true"/>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                      </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'dirpath-remote'">
                       <div class="row">
                        <div class="col-12">
                           <RemoteFileInput :root="root" v-on:changed-dir="onChangedDir" :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" v-model="parameters.val[param.name]" directory :label="param.caption"/>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                    </div>
                    </template>
                    <template v-else-if="paramType(param.type) === 'dictionary'">
                       <div class="row">
                        <div class="col-12">
                           <StringDictionaryEditor :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)"  :title="param.caption" v-model="parameters.val[param.name]"/>
                        </div>
                        <q-tooltip v-if="param.description">
                            {{ param.description }}
                        </q-tooltip>
                    </div>
                    </template>
                    <template v-else>
                      <div class="row">
                          <div class="col-12">
                            <q-input :disable="disable || param.disabled || !conditionCheck(parameters.val, param.disable_if)" dense :label="param.caption" type="text" v-model="parameters.val[param.name]"/>
                          </div>
                          <q-tooltip v-if="param.description">
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
import StringDictionaryEditor from 'src/components/StringDictionaryEditor.vue';

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
    'filepath-remote-mult':'filepath-remote-mult',
    'dirpath-remote':'dirpath-remote',
    'component':'component',
    'checkbox':'boolean',
    'array' : 'array',
    'dictionary': 'dictionary'
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
    },
    root: {
      type: String,
      default: '/'
    }
  },
  components: {
    RemoteFileInput,
    StringDictionaryEditor
  },
  setup (props, ctx) {
    const parameters = reactive<any>({val: null});
    const currentTemplate = computed(() => props.template);
    const model_computed = computed(() => props.modelValue);
    watch(parameters, (nv, ov) => {
      ctx.emit('update:modelValue', nv.val);
      ctx.emit('changedParam', nv.val);
    });
    watch(model_computed,(nv,ov) => {
      parameters.val = nv;
    });
    function onDev(ev) {
      console.log(parameters.val);
    }
    function onChangedDir(ev) {
      ctx.emit('changed-dir', ev);
    }
    function filterCanidates(all_params, options) {
      const pre_filtered: String[] = [];
      lodash.forEach(options, (arr: any) => {
        if ("if" in arr) {
          lodash.forEach(arr.if, (val: string, k: string) => {
            if (!val.includes(",")) {
              if (val === all_params[k]) {
                pre_filtered.push(arr);
              }
            } else {
              let mult_values = val.split(",");
              if (mult_values.includes(all_params[k])) {
                pre_filtered.push(arr);
              }
            }
            
          });
        } else {
          pre_filtered.push(arr);
        }
      })
      console.log(pre_filtered);
      return pre_filtered
    }

    watch(currentTemplate, (nv, ov) => {
      console.log(parameters.val);
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
      onChangedDir,
      filterCanidates,

    };
  }
});

</script>
