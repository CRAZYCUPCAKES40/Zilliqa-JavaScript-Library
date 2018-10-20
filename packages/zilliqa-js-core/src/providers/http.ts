import Mitt, {Emitter} from 'mitt';
import BaseProvider from './base';
import {
  RPCMethod,
  RPCRequest,
  RPCRequestPayload,
  RPCResponse,
  performRPC,
} from '../net';
import {composeMiddleware, ReqMiddlewareFn, ResMiddlewareFn} from '../util';
import {Provider, Subscriber, Subscribers} from '../types';

export default class HTTPProvider extends BaseProvider implements Provider {
  nodeURL: string;

  constructor(
    nodeURL: string,
    reqMiddleware: ReqMiddlewareFn[] = [],
    resMiddleware: ResMiddlewareFn[] = [],
  ) {
    super(reqMiddleware, resMiddleware);
    this.nodeURL = nodeURL;
  }

  buildPayload<T extends any[]>(method: RPCMethod, params: T): RPCRequest<T> {
    return {
      url: this.nodeURL,
      method,
      payload: {id: 1, jsonrpc: '2.0', params},
    };
  }

  send<P extends any[], R = any, E = string>(
    method: RPCMethod,
    ...params: P
  ): Promise<RPCResponse<R, E>> {
    const tReq = composeMiddleware(...this.reqMiddleware);
    const tRes = composeMiddleware(...this.resMiddleware);

    const req = tReq(this.buildPayload(method, params));

    return performRPC(req, tRes);
  }

  subscribe(event: string, subscriber: Subscriber): Symbol {
    throw new Error('HTTPProvider does not support subscriptions.');
  }

  unsubscribe(token: symbol) {
    throw new Error('HTTPProvider does not support subscriptions.');
  }
}
