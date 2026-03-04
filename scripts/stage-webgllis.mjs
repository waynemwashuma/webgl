import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const sourceModule = resolve('dist/index.module.js');
const sourceMap = resolve('dist/index.module.js.map');
const targetDir = resolve('dist/website/vendor/webgllis');
const targetModule = resolve(targetDir, 'index.module.js');
const targetMap = resolve(targetDir, 'index.module.js.map');

if (!existsSync(sourceModule)) {
  console.error('Missing dist/index.module.js. Run "npm run build-src" first.');
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
cpSync(sourceModule, targetModule);

if (existsSync(sourceMap)) {
  cpSync(sourceMap, targetMap);
}

console.log('Staged webgllis module to dist/website/vendor/webgllis/');
