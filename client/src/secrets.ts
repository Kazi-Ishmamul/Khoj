// https://vite.dev/guide/env-and-mode.html
// Laravel registers API routes under the /api prefix.
export const secrets = {
  backendEndpoint:
    import.meta.env.VITE_BACKEND_ENDPOINT ?? 'http://localhost:8000/api',
};
