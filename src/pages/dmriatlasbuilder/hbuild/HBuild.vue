<template>
  <div class="q-pa-md">
    <PromptDialog ref="promptDialog" v-model="newname"/>
    <ConfirmDialog ref="confirmDialogDelete" v-model="confirmed"/>
    <RemoteFileSelectDialog ref="fileDialog" multiple :root="root" v-model="selectedFiles" v-on:changed-dir="onChangedDir"/>
    <div class="row">
        <div><q-btn  :disable="disable" color="primary" flat icon="content_paste" @click="newTree">Clear HBuild</q-btn ><q-tooltip>Clear current tree</q-tooltip></div>
        <div><q-btn  :disable="disable" color="primary" flat icon="folder_open" @click="loadTree">Open HBuild</q-btn ><q-tooltip>Open hbuild file in json format</q-tooltip></div>
        <div><q-btn  color="primary" flat icon="download"  @click="saveTree">Download HBuild</q-btn ><q-tooltip>Save tree to file in json format)</q-tooltip></div>
        <q-input ref="fileInput" style="display:none" v-model="localFile" type="file" label="Standard" ></q-input>
        
    </div>
    <q-separator/>
    <div class="row">
      <div class="noselect row col-12">
          <div class="q-pa-md col-sm-6 col-xs-12 tree">
            <div class="row">
                <div class="q-pa-auto bg-primary text-h6 text-center text-white col-12">
                  Atlas Tree
                </div>
                <div class="col-12">
                      <q-tree
                        :nodes="nodes"
                        node-key="id"
                        v-model:selected="selectedNode"
                        ref="dataQTree">
                        <template v-slot:default-header="prop">
                            <div class="row">
                              <div>
                                {{prop.node.label}}
                              </div>
                              <div v-if="prop.node.children.length < 1">
                                <q-tooltip>
                                  Add Files
                                </q-tooltip>
                                <q-icon class="hover" v-if="!disable" color="primary" name="folder" @click="onAddFiles(prop.node)"></q-icon>
                              </div>
                              <div v-if="prop.node.files.length < 1">
                                <q-tooltip>
                                  Add Child Node
                                </q-tooltip>
                                <q-icon class="hover"  v-if="!disable" color="primary" name="add" @click="onAddNode(prop.node)"></q-icon>
                              </div>
                              <div>
                                <q-tooltip>
                                  Rename Node
                                </q-tooltip>
                                <q-icon class="hover"  v-if="!disable" color="warning" name="edit" @click="onEditNode(prop.node)"></q-icon>
                              </div>
                              <div>
                                <q-tooltip>
                                  Remove Node
                                </q-tooltip>
                                <q-icon class="hover"  v-if="prop.node.parent_id | !disable" color="red" name="delete" @click="onDeleteNode(prop.node)"></q-icon>
                              </div>
                              <div>
                                <q-chip class="q-mt-none" text-color="white" :color="prop.node.files.length > 0 ? 'primary':'red'" dense v-if="prop.node.children.length === 0">{{prop.node.files.length}}</q-chip>
                              </div>
                            </div>
                        </template>
                      </q-tree>
                </div>
            </div>
          </div>
          <div class="q-pa-md col-sm-6 col-xs-12">
            <HBuildFiles :disable="disable" :hidden="hidden" v-model="currentNode" v-on:file-removed="removeFileFromNode"/>
          </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect, ref, reactive} from 'vue';
import lodash from 'lodash';
import { download, getUUID } from 'src/utils';
import RemoteFileSelectDialog from 'src/components/RemoteFileSelectDialog.vue';
import PromptDialog from 'src/components/PromptDialog.vue';
import ConfirmDialog from 'src/components/ConfirmDialog.vue';
import { flattenQtree, generateFromRoot, hbuildFromFlatTree, hbuildFromQtree, qtreeFromHbuild, isUniqueId, isUniqueLabel, isUniqueNode } from '../convert';
import HBuildFiles from './HBuildFiles.vue';
import { useQuasar } from 'quasar';
import { useClientStore } from 'src/stores/dtiplayground.ts';

export default defineComponent({
  props: {
    modelValue: {
      type: Array,
      default: []
    },
    hidden: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    },
    root: {
      type: String,
      default: '/'
    }
  },
  components: {  
    RemoteFileSelectDialog,
    PromptDialog,
    ConfirmDialog,
    HBuildFiles
  },

  setup (props, ctx) {
    const client_store = useClientStore();
    const selectedNode = ref<any>(null);
    const selectedFiles = ref<any[]>([]);
    const localFile = ref<any>(null);
    const newname = ref<string | null>(null);
    const confirmed = ref<boolean>(false);
    const nodes = reactive<any[]>([{
                                      id: 'root',
                                      parent_id: null,
                                      label: 'FinalAtlas',
                                      files: [],
                                      is_root: true,
                                      children: []
                                  }]);
    const currentNode = ref<any>(null);
    const fileDialog = ref(null);
    const promptDialog = ref(null);
    const confirmDialogDelete = ref(null);
    const dataQTree = ref(null);
    const fileInput = ref(null);
    const nodeFiles = ref<any[]>([]);
    const $q = useQuasar();

    function onDev(ev) {
    }
    async function openTreeFile(file) {
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const hbuild = JSON.parse(ev.target.result);
        nodes[0] = qtreeFromHbuild(hbuild);
        localFile.value = null;
        currentNode.value = nodes[0];
        dataQTree.value.expandAll();
      });
      await reader.readAsText(file);
    }
    function onAddFiles(node) {
      currentNode.value = node;
      fileDialog.value.openModal();
    }
    function onAddNode(node) {
      const newId = `${node.id}.child${getUUID().slice(0,8)}`;
      const newLabel = `Subject-${getUUID().slice(0,8)}`;
      const newNode = {
          id: newId,
          parent_id : `${node.id}`,
          label: newLabel,
          files: [],
          children: [],
          expanded: true,
      };
      if (isUniqueNode(nodes[0], newNode)) {
        node.children.push(newNode)    
        node.expanded = true;    
      } 
    }
    function onEditNode(node) {
      currentNode.value = node;
      promptDialog.value.openModal(node.label);
    }
    function onDeleteNode(node) {
      confirmed.value = false;
      confirmDialogDelete.value.openModal();
    }
    watch(confirmed, (nv, ov) => {
      if(nv) {
        deleteNode(currentNode.value);
      } else {
      }
    });
    function deleteNode(node) {
      console.log(confirmed.value);
      if (!node.parent_id) return;
      const parent_node = dataQTree.value.getNodeByKey(node.parent_id);
      parent_node.children = parent_node.children.filter((x) => x !== node)      
    }
    function newTree(ev) {
      nodes[0] =    {
                      id: 'root',
                      parent_id: null,
                      label: 'FinalAtlas',
                      files: [],
                      is_root: true,
                      children: []
                    };
      currentNode.value = nodes[0];
    }
    function loadTree(ev) {
      fileInput.value.$el.click();
    }
    function saveTree(ev) {
      const tree = hbuildFromQtree(nodes[0]);
      const hbuild = JSON.stringify(tree, null, 2);
      download("hbuild.json",hbuild);
    }
    function removeFileFromNode(ev) {
      const { id, file } = ev;
      const node = dataQTree.value.getNodeByKey(id);
      node.files = node.files.filter((x) => x !== file );
    }
    function onChangedDir(ev) {
      ctx.emit('changed-dir', ev);
    }
    watch(nodes, (nv, ov) => {
      const text = JSON.stringify(nodes, null, 2);
      ctx.emit('update:modelValue', nodes);
      ctx.emit('changed-param', nodes);
    });
    watch(localFile, (nv, ov) => {
      if (!localFile.value) return;
      openTreeFile(nv[0]);
    });
    watch(newname, (nv, ov) => {
      if (nv !== ov) {
        if (isUniqueLabel(nodes[0],nv)) {
          currentNode.value.label = nv;
          $q.notify({
            message : 'Name changed',
            color: 'green'
          })
        } else {
          $q.notify({
            message : 'Not unique label',
            color: 'red'
          })
        }        
      }
    });
    watch(selectedFiles, (nv, ov) => {
      if (currentNode.value.files == null) currentNode.value.files = [];
      currentNode.value.files.push(...nv.map((x) => x.path));
      currentNode.value.files = lodash.uniq(currentNode.value.files);
    });
    watch(selectedNode, (nv, ov) => {
      if (!nv) selectedNode.value = ov;
      currentNode.value = dataQTree.value.getNodeByKey(selectedNode.value);
    });
    onMounted(async () => {
      if (props.modelValue.length > 0) {
        nodes[0] = props.modelValue[0];
      } else {
        newTree();
      }
      dataQTree.value.expandAll();
      currentNode.value = nodes[0];
    });
    return {
      nodes,
      selectedNode,
      currentNode,
      selectedFiles,
      newname,
      confirmed,
      onDev,
      openTreeFile,
      loadTree,
      saveTree,
      newTree,
      fileDialog,
      dataQTree,
      promptDialog,
      confirmDialogDelete,
      onEditNode,
      onDeleteNode,
      onAddNode,
      onAddFiles,
      fileInput,
      localFile,
      removeFileFromNode,
      onChangedDir,
    };
  }
});

</script>
<style>

.hover {
  color: #0000;
  background: 
    linear-gradient(90deg,#1095c1 50%,#000 0) 
    var(--_p,100%)/200% no-repeat;
  -webkit-background-clip: text;
          background-clip: text;
/*  transition: .1s;*/
}
.hover:hover {
  --_p: 0%;
}

.selected {
  
  opacity: 0.5;
}

</style>