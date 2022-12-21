import { defineStore, storeToRefs } from 'pinia';
import Client from 'src/api/client';
import { SERVER_URL } from 'src/environments';
import { getUUID } from 'src/utils';



export const useClientStore = defineStore('apiClient', {
  state: () => ({
    _client : Client.Create(process.env.DEV? SERVER_URL: '/')
  }),
  getters: {
    client(state) {
      return state._client;
    },
    getClient(state) {
      return state._client;
    }
  }
});

export const useGlobalNotification = defineStore('globalNotification', {
  state: () => ({
    disabled: false,
    message: ''
  }),
  actions: {
    disable(tf = true) {
      this.disabled = tf;
    },
    notify(message) {
      if (!this.disabled) {
        this.message = message
      }
    }
  }

});

export const useInterval = defineStore('timeInterval', {
  state: () => ({
    _intervals : {}
  }),
  getters: {
    intervals(state) {
      return state._intervals
    }
  },
  actions: {
    addInterval(id: string, fn, interval: number) {
      this._intervals[id] = setInterval(fn, interval);
    },
    removeInterval(id) {
      clearInterval(this._intervals[id]);
    }
  }
});

export const useGlobalVariables = defineStore('useGlobalvariables', {
  state: () => ({
    currentApplication : null,
    _applicationInfo: {},
    _userData: {},
  }),  
  getters: {
    applicationInfo(state) {
      return state._applicationInfo;
    },
    userData(state) {
      return state._userData;
    }
  },
  actions: {
    async initialize() {
      const $c = useClientStore();
      this.client = await $c.client;
      await this.getApplicationInfo();
    },
    setApplicationName(name) {
      this.currentApplication = name;
    },
    setWorkingDirectory(dir) {
      this._userData.workingDirectory = dir;
    },
    async getApplicationInfo() {
      const $c = useClientStore();
      const client = await $c.client;
      const { data } = await client.getAppInfo();
      this._applicationInfo = data;
    }
  }
});
