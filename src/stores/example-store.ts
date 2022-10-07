import { defineStore } from 'pinia';


import Client from 'api/client';
import { SERVER_URL } from '@/environment';

export const useServiceStore = defineStore('serviceWorker',{
  state : () => ({
    serviceWorker: {}
  }),
  actions: {
    setServiceWorker(sw: any) {
      this.serviceWorker = sw;
    }
  },
  getters: {
    getServiceWorker(state) {
      return state.serviceWorker;
    }
  }
});

export const useClientStore = defineStore('apiClient', {
  state: () => ({
    client : Client.Create(SERVER_URL )
  }),
  getters: {
    getClient(state) {
      return state.client;
    }
  }
});
export const useCounterStore = defineStore('counter', {
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter++;
    },
  },
});
