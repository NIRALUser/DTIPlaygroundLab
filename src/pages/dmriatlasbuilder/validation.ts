
export function validateParameters(params) {
  if (!params) return false;
  // if (!(params.affine_atlas && params.diffeomorphic_atlas && params.final_resample && params.execution)) return false;  
  if (!params.execution.m_OutputPath) return false;
  if (params.execution.m_OutputPath === '') return false;
  return true;
}

export function validateTree(qtree) {
  if (!qtree) return false;
  if (qtree.children.length < 1 && qtree.files.length < 2) return false;
  return true;
}

export function validateAtlasParams(params, qtree) {
  return validateParameters(params) & validateTree(qtree);
}