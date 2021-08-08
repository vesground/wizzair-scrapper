const request = require('request');

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