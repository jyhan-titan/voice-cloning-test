type ReactNativeWebViewHandle = {
  postMessage?: (data: string) => void;
};

const getReactNativeWebView = (): ReactNativeWebViewHandle | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { ReactNativeWebView?: unknown })
    .ReactNativeWebView as ReactNativeWebViewHandle | undefined;
};

export const isReactNativeWebView = (): boolean => {
  return Boolean(getReactNativeWebView());
};

export const postToReactNativeWebView = (message: unknown): boolean => {
  const rn = getReactNativeWebView();
  if (!rn?.postMessage) return false;
  rn.postMessage(JSON.stringify(message));
  return true;
};
