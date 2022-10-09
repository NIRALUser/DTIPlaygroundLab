<template>
  <div class="q-pa-md">
    <PromptDialog ref="promptDialog" v-model="newname"/>
    <RemoteFileSelectDialog ref="fileDialog" root="/mnt/niral/Zylka/DTI/tests-dmriatlasbuilder/images_dti" v-model="selectedFiles"/>
    <div class="row toolbar">
      <div>
        <p> DMRI AtlasBuilder HBuild Generator </p>
          <q-btn color="primary" @click="newTree">New HBuild</q-btn >
          <q-btn color="secondary" @click="loadTree">Open HBuild</q-btn >
          <q-input ref="fileInput" style="display:none" v-model="localFile" type="file" label="Standard" ></q-input>
          <q-btn color="warning" @click="saveTree">Save HBuild</q-btn >
      </div>
    </div>
    <div class="row">
      <div class="noselect row col-12">
          <div class="col-6 tree">
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
                      <q-icon class="hover"  color="primary" name="folder" @click="onAddFiles(prop.node)"></q-icon>
                    </div>
                    <div v-if="prop.node.files.length < 1">
                      <q-tooltip>
                        Add Child Node
                      </q-tooltip>
                      <q-icon class="hover"  color="primary" name="add" @click="onAddNode(prop.node)"></q-icon>
                    </div>
                    <div>
                      <q-tooltip>
                        Rename Node
                      </q-tooltip>
                      <q-icon class="hover"  color="warning" name="edit" @click="onEditNode(prop.node)"></q-icon>
                    </div>
                    <div>
                      <q-tooltip>
                        Remove Node
                      </q-tooltip>
                      <q-icon class="hover"  v-if="prop.node.parent_id" color="red" name="delete" @click="onDeleteNode(prop.node)"></q-icon>
                    </div>
                    <div>
                      <q-chip class="q-mt-none" text-color="white" color="secondary" dense v-if="prop.node.children.length === 0">{{prop.node.files.length}}</q-chip>
                    </div>
                  </div>
              </template>
            </q-tree>
          </div>
          <div class="col-6">
            <HBuildFiles v-model="currentNode" v-on:file-removed="removeFileFromNode"/>
          </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, onMounted, watch, watchEffect, ref, reactive} from 'vue';
import { useClientStore } from 'src/stores';
import lodash from 'lodash';
import { download, getUUID } from 'src/utils';
import RemoteFileSelectDialog from 'src/components/RemoteFileSelectDialog.vue';
import PromptDialog from 'src/components/PromptDialog.vue';
import { flattenQtree, generateFromRoot, hbuildFromFlatTree, hbuildFromQtree, qtreeFromHbuild, isUniqueId, isUniqueLabel, isUniqueNode } from '../convert';
import HBuildFiles from './HBuildFiles.vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  props: {
    modelValue: {
      type: Array,
      default: []
    }
  },
  components: {  
    RemoteFileSelectDialog,
    PromptDialog,
    HBuildFiles
  },

  setup (props, ctx) {
    const client_store = useClientStore();
    const selectedNode = ref<any>(null);
    const selectedFiles = ref<any[]>([]);
    const localFile = ref<any>(null);
    const newname = ref<string | null>(null);
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
    const promptDialog = ref(null)
    const dataQTree = ref(null);
    const fileInput = ref(null);
    const nodeFiles = ref<any[]>([]);
    const $q = useQuasar();

    function onDev(ev) {
      // console.log(parameters.value);
    }
    async function openTreeFile(file) {
      // console.log(file);
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const hbuild = JSON.parse(ev.target.result);
        nodes[0] = qtreeFromHbuild(hbuild);
        localFile.value = null;
        currentNode.value = nodes[0];
      });
      await reader.readAsText(file);
    }
    function onAddFiles(node) {
      currentNode.value = node;
      fileDialog.value.openModal();
    }
    function onAddNode(node) {
      // console.log(`Adding child for ${node.id}`);
      // console.log(node);

      const newId = `${node.id}.child${getUUID().slice(0,8)}`;
      const newLabel = `Subject-${getUUID().slice(0,8)}`;
      const newNode = {
          id: newId,
          parent_id : `${node.id}`,
          label: newLabel,
          files: [],
          children: [],
      };
      // console.log(newNode);
      if (isUniqueNode(nodes[0], newNode)) {
        node.children.push(newNode)        
      }
    }
    function onEditNode(node) {
      // console.log(`Renaming ${node.id}`);
      // console.log(node);
      currentNode.value = node;
      promptDialog.value.openModal(node.label);
    }
    function onDeleteNode(node) {
      // console.log(`Deleting ${node.id}`);
      // console.log(nodes.value);
      if (!node.parent_id) return;
      const parent_node = dataQTree.value.getNodeByKey(node.parent_id);
      // console.log(parent_node);
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

    watch(nodes, (nv, ov) => {
      const text = JSON.stringify(nodes, null, 2);
      localStorage.setItem('dtiab-tree', text);
      ctx.emit('update:modelValue', nodes);
      ctx.emit('changed-param', nodes);
    });
    watch(localFile, (nv, ov) => {
      if (!localFile.value) return;
      // console.log(nv);
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
      const cachedNodes = localStorage.getItem('dtiab-tree');
      if (cachedNodes) {
        const parsed = JSON.parse(cachedNodes);
        nodes[0] = parsed[0];
      } else {
        newTree();
      }
    });
    return {
      nodes,
      selectedNode,
      currentNode,
      selectedFiles,
      newname,
      onDev,
      openTreeFile,
      loadTree,
      saveTree,
      newTree,
      fileDialog,
      dataQTree,
      promptDialog,
      onEditNode,
      onDeleteNode,
      onAddNode,
      onAddFiles,
      fileInput,
      localFile,
      removeFileFromNode,
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