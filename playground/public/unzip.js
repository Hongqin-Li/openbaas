const fs = require('fs');

const path = require('path');
const util = require('util');
const zlib = require('zlib');

const zipbuf = fs.readFileSync('index.zip');
console.log(zipbuf.toString());

const exec = util.promisify(require('child_process').exec);

async function run() {
  const { stdout, stderr } = await exec('unzip -fo index.zip && exit 0');
  console.log(stdout, stderr);
}

run();


