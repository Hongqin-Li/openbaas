/* eslint-disable functional/no-throw-statement */

import logger from '../logger';

/**
 * AddSource
 * UpdateSource
 * DeleteSource
 * DeployBySourceUrl
 *
 */
export async function beforeAddSource(req: Parse.Cloud.FunctionRequest) {
  console.log(req);
}

export async function addSource(req: Parse.Cloud.FunctionRequest) {
  const user = req.user;
  const { src } = req.params;
  if (!user) {
    throw new Parse.Error(400, 'Please login first');
  }
  if (user.id) {
    logger.info('todo');
  }
}

export async function updateSource(req: Parse.Cloud.FunctionRequest) {
  const user = req.user;
  if (!user) throw new Parse.Error(400, 'Please login first');
  const { id } = req.params;
}
