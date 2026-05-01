export function money(value) {
  return new Intl.NumberFormat('en-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function shortDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('en-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString === '' ? '' : `?${queryString}`;
}

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost/api';

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  const requestOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_ROOT}${path}`, requestOptions);
  const text = await response.text();
  let payload = {};

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      throw new Error('The server returned an invalid response.');
    }
  }

  if (!response.ok || payload.status === 'error') {
    throw new Error(payload.message || 'Something went wrong.');
  }

  return payload;
}
