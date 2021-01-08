/* eslint-disable functional/no-throw-statement */
import { exec as child_process_exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';

// import k8s from '@kubernetes/client-node';
import { ensureFileSync } from 'fs-extra';
import tmp from 'tmp';

import logger from '../logger';

const exec1 = util.promisify(child_process_exec);

export function encode(s: string) {
  return Buffer.from(s, 'utf-8').toString('hex');
}
export function decode(s: string) {
  return Buffer.from(s, 'hex').toString('utf-8');
}

function user_namespace(uid: string) {
  return `ob-user-${encode(uid)}`;
}

function user_image_page(uid: string) {
  return `ob-page-${encode(uid)}`;
}

// FIXME: just by `kubectl proxy`
function external_url(namespace: string, service: string) {
  return `http://127.0.0.1:8001/api/v1/namespaces/${namespace}/services/${service}/proxy/`;
}

export async function getPageUrlByUserId(req: Parse.Cloud.FunctionRequest) {
  const { params } = req;
  const uid = params.uid;
  logger.info('params and uid', params, uid);
  if (uid) {
    logger.info('user id', uid);
    const namespace = user_namespace(uid);
    const { stdout } = await exec1(
      `kubectl get svc -n ${namespace} -l "type=page"`
    );
    const pageUrl = external_url(namespace, user_image_page(uid));
    const query = new Parse.Query(Parse.User);
    query.equalTo('objectId', uid);
    const user = await query.first();
    logger.info('get user', user);
    const pageSourceUrl = user.get('PageSourceUrl');
    return { pageUrl, pageSourceUrl };
  } else return {};
}

export async function deployMyPageByUrl(req: Parse.Cloud.FunctionRequest) {
  const url = req.params.url;
  const user = req.user;

  if (!user) {
    throw new Parse.Error(400, 'Please login first');
  }

  const dir = tmp.dirSync();
  async function exec(cmd: string) {
    return await exec1(cmd, { cwd: dir.name });
  }

  logger.info('user', user);

  const zip_file = path.resolve(dir.name, 'public', 'index.zip');
  const dockerfile = path.resolve(dir.name, 'Dockerfile');
  const deploy_file = path.resolve(dir.name, 'deploy.yml');

  const image_name = user_image_page(user.id);
  const namespace = user_namespace(user.id);

  ensureFileSync(zip_file);

  logger.info('files', zip_file, dockerfile, deploy_file);

  // Retrieve index.zip
  const resp = await Parse.Cloud.httpRequest({ url });
  await fs.writeFile(zip_file, resp.buffer, 'binary');

  // Unzip index.zip
  await exec(`unzip -o ${zip_file} -d public`);

  logger.info('Create Dockerfile and build');
  await fs.writeFile(
    dockerfile,
    `
FROM nginx:1.13.0-alpine
COPY ./public /usr/share/nginx/html
`
  );

  await exec(`docker build -t ${image_name} .`);

  // Load to kind's internal docker so that we can use it in the cluster
  await exec(`kind load docker-image ${image_name}`);

  // NOTE: use local docker images by `imagePullPolicy: Never`
  // Create Deployment file and and deploy to k8s
  await fs.writeFile(
    deploy_file,
    `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${image_name}
  labels:
    app: page
spec:
  replicas: 1
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app: page
  template:
    metadata:
      labels:
        app: page
    spec:
      containers:
      - name: ${image_name}
        image: ${image_name}
        imagePullPolicy: Never
        ports:
        - containerPort: 80
`
  );

  // Create user namespace if not exist
  // List the namespace by `kubectl get namespaces`
  try {
    await exec(`kubectl create namespace ${namespace}`);
  } catch (err) {
    logger.warn('create ns error', err);
  }

  // Deploy to k8s
  try {
    await exec(`kubectl delete -f ${deploy_file} --namespace ${namespace}`);
  } catch (err) {
    logger.warn(
      'delete deployment error, maybe deployment not exists before',
      err
    );
  } finally {
    await exec(`kubectl apply -f ${deploy_file} --namespace ${namespace}`);
  }

  try {
    await exec(`kubectl delete service ${image_name} --namespace ${namespace}`);
  } catch (err) {
    logger.warn('delete service error, maybe svc not exists before', err);
  } finally {
    await exec(
      `kubectl expose deployment ${image_name} --namespace ${namespace}`
    );
  }

  // Update user page url
  user.set('pageSourceUrl', url);
  await user.save(null, { sessionToken: user.getSessionToken() });
  logger.info('update page info of user', user);

  return { url: external_url(namespace, image_name) };
}
