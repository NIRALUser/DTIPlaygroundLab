
export function validateParameters(params) {
  if (!params) return false;
  // if (!(params.affine_atlas && params.diffeomorphic_atlas && params.final_resample && params.execution)) return false;  
  if (!params.output_directory) return false;
  if (params.output_directory === '') return false;
  return true;
}


export const  validatePrepParams = validateParameters;
