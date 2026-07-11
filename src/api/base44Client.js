import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { runtimeConfig } from '@/config/runtime-config';

const { token, functionsVersion } = appParams;
const { appId, appBaseUrl } = runtimeConfig;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});
