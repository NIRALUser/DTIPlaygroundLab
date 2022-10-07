/* eslint-disable lines-between-class-members */
/* eslint-disable no-underscore-dangle */
import axios from 'axios';
// import {} from '@/types';

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

  constructor(serverURL: string) {

    this.axios = axios.create({
      baseURL: serverURL,
      headers: { common: { } },
    });
    this.serverURL = serverURL;
  }

  async initAsync() {
      // this.workers = await this.getWorkerSummary();
  }

  // API Check
  async checkVersion(): Promise<any> {
    const resp = await this.axios.get('/api/v1/version');
    return resp.data;
  }

  // API file browser
  async listFiles(rootdir: string): Promise<any[]> {
    const payload = { params: { root_dir: rootdir }}
    const resp = await this.axios.get('/api/v1/files', payload);
    return resp.data;
  }
}
