import lodash from 'lodash';

// Parameter convert

export function convertABParameters(params: any): any {
  let res = {};
  lodash.forIn(params, (v, k) => {
    res = Object.assign(res, v);
  });
  if (res['m_RegMethod'] === 'BRAINS') {
    res['m_DTIRegOptions'] = res['m_DTIRegOptions_BRAINS'];
  } else {
    res['m_DTIRegOptions'] = res['m_DTIRegOptions_ANTS'];
  }
  return res;
}

// Qtree to hbuild

export function flattenQtree(qtree): any[] {
  let tree = [];
  if (qtree.children.length > 0) {
    tree.push(qtree);
    lodash.forEach(qtree.children, (v, i) => {
      tree.push(flattenQtree(v));
    });
  } else {
    tree.push(qtree)
    return tree.flat();
  }
  return tree.flat();
}

export function hbuildFromFlatTree(flattree: any[]): any {
  let hbuild = { build: {}, project: { target_node : flattree[0].label }};
  lodash.forEach(flattree, (v, i) => {
    if (v.files.length >= 0 || v.children.length >=0) {
      hbuild.build[v.label] = {
        label: v.label,
        id: v.id,
        components : v.children.map((x) => x.label),
        datasetfiles : v.files,
        filetype : 'list',
        type: v.files.length > 0 ? 'end_node' : 'node'
      }      
    }
  });
  return hbuild
}

export function hbuildFromQtree(qtree): any {
  return hbuildFromFlatTree(flattenQtree(qtree));
}

// Hbuild to Qtree

export function generateFromRoot(components, root_node_label = 'root', parent_id = null): any {
  const root = components[root_node_label];
  let tree = {
    id: root.id,
    label: root.label,
    parent_id,
    files: root.datasetfiles,
    children: []
  }
  if (root.type === 'end_node') {
    return tree;
  } else {
    lodash.forEach(root.components, (v, i) => {
      tree.children.push(generateFromRoot(components, v, root.id))
    });
  }
  return tree;
}
export function qtreeFromHbuild(hbuild): any {
  return generateFromRoot(hbuild.build, hbuild.project.target_node);
}

// validation

export function isUniqueLabel(qtree, label) {
  const flattened = flattenQtree(qtree);

  const result = !flattened.map((x) => x.label).includes(label);
  return result;
}

export function isUniqueId(qtree, id) {
  const flattened = flattenQtree(qtree);
  const result = !flattened.map((x) => x.id).includes(id);
  return result;
}

export function isUniqueNode(qtree, node) {
  return isUniqueLabel(qtree, node.label) & isUniqueId(qtree, node.id);
}