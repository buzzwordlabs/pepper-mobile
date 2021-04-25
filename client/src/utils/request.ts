import axios, {AxiosResponse, Method, AxiosRequestConfig} from 'axios';
import {readCache} from './cache';
import ENV from '../../env';
import {bugsnag} from '../utils/bugsnag';

export interface PepperAxiosResponse extends AxiosResponse {
  ok?: boolean;
}

export interface RequestParams {
  url: string;
  method: Method;
  body?: any;
  optionalHeaders?: any;
  onUploadProgress?: (progressEvent: any) => void;
}

const request = async ({
  url,
  method,
  body,
  optionalHeaders,
  onUploadProgress,
}: RequestParams): Promise<PepperAxiosResponse> => {
  const authToken = await readCache('authToken');
  let response: PepperAxiosResponse;
  try {
    bugsnag.leaveBreadcrumb('request', {
      type: 'request',
      endpoint: url,
      method,
    });
    response = await axios({
      url,
      method: method,
      data: body,
      baseURL: ENV.API_BASE_URL,
      headers: authToken ? {Authorization: `Bearer ${authToken}`} : {},
      onUploadProgress,
      ...optionalHeaders,
    });
    response.ok = true;
    return response;
  } catch (err) {
    err.response.ok = false;
    return err.response;
  }
};

export {request};
