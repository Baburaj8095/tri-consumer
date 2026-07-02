export const env = {
  apiBaseUrl: 'https://www.trikonekt.com',
  captainApiUrl: 'https://api-captain.trikonektbusiness.com/api',
  mapboxApiKey: '',
};

export const isLocalhostUrl = (url: string) => url.includes('localhost') || url.includes('127.0.0.1');
export const toAndroidEmulatorUrl = (url: string) => url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');