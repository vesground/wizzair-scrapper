const request = require('request');

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    // We don’t escape the key '__proto__'
    // which can cause problems on older engines
    if (v instanceof Map) {
      obj[k] = strMapToObj(v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
 function execShellCommand(cmd) {
  const exec = require('child_process').exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
         
      if (stdout) {
        console.log('Shell says \n', stderr);
        resolve(stdout);
      } else {
        reject(stderr)
      }
    });
  });
}

 function asyncRequest(payload) {
   return new Promise((resolve, reject) => {
      request(payload, (error, response, body) => {
        if (error) reject(error);
        resolve(response);
     })
   })
 }

function sleep(duration) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), duration);
  })
}

async function waitUntil(getCondition) {
  while(!getCondition()) {
    await sleep(500);
  }
}

module.exports = {
  execShellCommand,
  asyncRequest,
  strMapToObj,
  objToStrMap,
  waitUntil,
}