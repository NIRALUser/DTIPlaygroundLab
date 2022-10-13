/* eslint-disable lines-between-class-members */
/* eslint-disable no-underscore-dangle */
import axios from 'axios';

export default class Client {
  public axios;

  serverURL: string;

  /**
   * Create and return a client instance. This is done in a helper function
   * to allow for asynchronous construction.
   * @param serverURL The base URL of the API server to use
   * @param token The access token (JWT) to use for each request
   * @returns The instantiated client.
   */
  static async Create(serverURL: string): Promise<Client> {
    const client = new Client(serverURL);
    await client.initAsync();
    return client;
  }

  constructor(serverURL: string, store: any) {

    this.axios = axios.create({
      baseURL: serverURL,
      headers: { common: { } },
    });
    this.serverURL = serverURL;
    this.axios.interceptors.request.use(function (request) {
      return request;
    });
    this.axios.interceptors.response.use(function (response) {
      // if (process.env.DEV) 
      console.log('Response', response);
      return response;
    }, function(error) {
      console.log("Error!",error.response.data);
      return Promise.reject(error);
    });
  }

  async initAsync() {
      // this.workers = await this.getWorkerSummary();
  }

  // API Check
  async checkVersion(): Promise<any> {
    return this.axios.get('/api/v1/version').then((r) => {
      return r.data;
    }).catch((e) => {
      throw e;
    });
  }

  // API file browser
  async listFiles(rootdir: string): Promise<any[]> {
    const payload = { params: { root_dir: rootdir }}
    return this.axios.get('/api/v1/files', payload).then((r) => {
      return r.data;
    }).catch((e) =>{
      throw e;
    });
  }
  async getTextFileContent(path: string, last_line: number): Promise<any> {
    const payload = { params: { path, last_line }};
    return this.axios.get('/api/v1/files/get-text', payload).then((r) => {
      return r.data;
    }).catch((e) =>{
      throw e;
    });    
  }
  async getReadMe(): Promise<any> {
    return this.axios.get('/api/v1/files/get-readme').then((r) => {
      return r.data;
    }).catch((e) =>{
      throw e;
    });      
  }
  // DMRIPrep 
  async DMRIPrep_getApplicationInfo(): Promise<any> {
    return this.axios.get('/api/v1/dmriprep').then((r) => {
      return r.data;
    }).catch((e) =>{
      throw e;
    });    
  } 
  async DMRIPrep_getTemplate(name): Promise<any> {
    const payload = { params: { name } };
    return this.axios.get('/api/v1/dmriprep/template', payload).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error
    });
  }  
  async DMRIPrep_generateOutputDirectory(payload: any): Promise<any> {
    return this.axios.post('/api/v1/dmriprep/generate-default-protocols', payload).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error
    });
  }

  async DMRIPrep_execute(payload: any): Promise<any> {
    return this.axios.post('/api/v1/dmriprep', payload).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error
    });
  }  
  // DMRIAtlasbuilder
  async DMRIAtlasbuilder_generateOutputDirectory(payload: any): Promise<any> {
    return this.axios.post('/api/v1/dmriatlasbuilder/parameters', payload).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error
    });
  }

  async DMRIAtlasbuilder_execute(payload: any): Promise<any> {
    return this.axios.post('/api/v1/dmriatlasbuilder', payload).then((response) => {
      return response.data;
    }).catch((error) => {
      throw error
    });
  }
}
