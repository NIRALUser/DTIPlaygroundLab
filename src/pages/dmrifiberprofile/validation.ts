
export function validateParameters(params) {
  if (!params) return false;
  // if (!(params.affine_atlas && params.diffeomorphic_atlas && params.final_resample && params.execution)) return false;  
  if (!params.output_directory) return false;
  if (params.output_directory.trim() === '') return false;
  if (!params.input_image_1) return false;
  if (!params.input_image_1.trim()) return false;
  return true;
}


export const  validatePrepParams = validateParameters;
