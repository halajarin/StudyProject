export const environment = {
  production: false,
  // Use relative URL for Kubernetes deployment (/portal/bff/ecoride/api)
  // or localhost for local development
  apiUrl: window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/portal/bff/ecoride/api'
};
