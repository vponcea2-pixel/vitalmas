export const runtimeConfig = {
  appId: import.meta.env.VITE_BASE44_APP_ID || '6a5152f9a3095cd800ed925a',
  appBaseUrl:
    import.meta.env.VITE_BASE44_APP_BASE_URL ||
    'https://psychedelic-vital-plus-flow.base44.app',
};

// Disable SDK analytics on static hosts before the client is created. The SDK
// otherwise validates an anonymous visitor with User/me just to send telemetry.
if (typeof window !== 'undefined') {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('analytics-enable')) {
    url.searchParams.set('analytics-enable', 'false');
    window.history.replaceState({}, document.title, url.toString());
  }
}
