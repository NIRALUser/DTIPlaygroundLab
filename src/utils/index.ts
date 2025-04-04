import lodash from 'lodash';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const dummyFunction = () => {};
export const randomString = () => Math.random().toString(36).substring(2, 15);
export const mod = (n: number, m: number): number => ((n % m) + m) % m;

export function getUUID() {
  return uuidv4();
}

export function currency_format(currency: string, decimal: number) {
  const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimal, maximumFractionDigits: decimal });
  return formatter;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function moveArrayElement(arr, from, to) {
    const element = arr.splice(from,1)[0];
    arr.splice(to, 0, element);
    return arr;   

}

// Path 

export function ParentNameFromPath(path: string) {
    const tmp = path.split('/');
    const parent = tmp.splice(0,tmp.length-1).join('/');
    if (parent.trim() ==='') return [ '/', '' ]
    const name = tmp[tmp.length-1];
    return [parent, name];
}


// Router
export function generateRouteByQuery(currentRoute: any, query: any) {
  const route = currentRoute;
  const newroute = {
    name: route.name || undefined,
    path: route.path,
    params: route.params,
    query,
  };
  return newroute;
}

export function formatDateTime(dt: any) {
  const y = dt.getYear() + 1900;
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const h = dt.getHours();
  const min = dt.getMinutes();
  const s = dt.getSeconds();
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export function formatDate(dt: any) {
  const y = dt.getYear() + 1900;
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  let m_str = `${m}`;
  let d_str = `${d}`;
  if (m < 10) m_str = `0${m}`;
  if (d < 10) d_str = `0${d}`;
  return `${y}-${m_str}-${d_str}`;
}

export function getToday() {
  const today = new Date();
  return formatDate(today);
}

export function objectToArray(obj: any) {
  if (!obj) return [];
  const outArray: any[] = [];
  lodash.forIn(obj, (v, k) => {
    const s = {
      key: k,
      value: v,
    };
    outArray.push(s);
  });
  return outArray;
}

export function convertTZ(date: string, tzString: string) {
  return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
}

export function convertLocal(date: string) {
  return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString());
}

export function arrayToObject(arr: any[]) {
  if (!arr || arr.length < 1) return {};
  const outObject: any = {};
  lodash.each(arr, (v, i) => {
    outObject[v.key] = v.value;
  });
  return outObject;
}

export const inputRules: any = {
  nonEmpty: (x: string) => {
    if (!x) return 'Must not be empty';
    return x.trim() !== '' || 'Must not be empty';
  },
  isEmail: (x: string) => {
    if (!x) return 'Email address is missing';
    const pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(x) || 'Not a proper email address';
  },
  isNumber: (x: string) => {
    const n = Number(x);
    return (!Number.isNaN(n)) || 'Numbers only';
  },
  isDate: (x: string) => {
    const pattern = new RegExp(/^\d{4}-\d{2}-\d{2}$/);
    return pattern.test(x) || 'Date should be in te format of YYYY-MM-DD';
  },
  isTime: (x: string) => {
    const pattern = new RegExp(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
    return pattern.test(x) || 'Time format should be HH:MM';
  },
};

export function urlB64ToUint8Array(base64String: string): any {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function conditionCheck(parameters: any, conditionDict: any) {
  if (!conditionDict) return true;
  let res = true;
  const condition_keys = lodash.keys(conditionDict);
  lodash.forEach(condition_keys, (k: any) => {
    if (!conditionDict[k].includes(",")) {
      if (conditionDict[k] !== parameters[k]) {
        res=false;
      }
    } else {
      let mult_values = conditionDict[k].split(",");
      if (!mult_values.includes(parameters[k])) {
        res=false;
      }
    }
       
  }); 
  return res;
}