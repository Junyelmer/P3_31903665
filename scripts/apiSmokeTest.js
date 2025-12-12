'use strict';

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DEFAULT_PASSWORD = process.env.TEST_PASSWORD || 'Test12345!';

const http = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
  timeout: Number(process.env.HTTP_TIMEOUT || 15000)
});

const toJsonSafe = (value) => {
  if (value === undefined || value === null) {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    return String(value);
  }
};

const logResponse = async (label, requestFn) => {
  console.log(`\n================ ${label.toUpperCase()} ================`);
  const response = await requestFn();
  const { config } = response;
  const payload = config && config.data ? (() => {
    try {
      return JSON.stringify(JSON.parse(config.data), null, 2);
    } catch (err) {
      return config.data;
    }
  })() : undefined;

  console.log('Request:', {
    method: config ? config.method : 'unknown',
    url: config ? config.baseURL + config.url : 'unknown',
    headers: config ? config.headers : undefined,
    body: payload
  });

  console.log('Response:', {
    status: response.status,
    statusText: response.statusText,
    data: toJsonSafe(response.data)
  });

  return response;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

const randomEmail = () => {
  const random = crypto.randomBytes(4).toString('hex');
  return `smoke${random}@example.com`;
};

(async () => {
  console.log('Base URL =>', BASE_URL);

  // Public endpoints
  await logResponse('GET /about', () => http.get('/about'));
  await logResponse('GET /ping', () => http.get('/ping'));
  await logResponse('GET /health', () => http.get('/health'));

  // Register new user
  const email = process.env.TEST_EMAIL || randomEmail();
  const registerPayload = {
    nombreCompleto: 'Smoke Tester',
    email,
    password: DEFAULT_PASSWORD
  };

  const registerRes = await logResponse('POST /auth/register', () => http.post('/auth/register', registerPayload));
  let token = registerRes.data && registerRes.data.data ? registerRes.data.data.token : null;

  // Login as fallback
  if (!token || registerRes.status !== 201) {
    const loginRes = await logResponse('POST /auth/login', () => http.post('/auth/login', {
      email,
      password: DEFAULT_PASSWORD
    }));
    token = loginRes.data && loginRes.data.data ? loginRes.data.data.token : null;
    if (!token) {
      throw new Error('Unable to obtain JWT token');
    }
  } else {
    await logResponse('POST /auth/login', () => http.post('/auth/login', {
      email,
      password: DEFAULT_PASSWORD
    }));
  }

  const authConfig = { headers: authHeaders(token) };

  // Users
  await logResponse('GET /users', () => http.get('/users', authConfig));

  const managedUserPayload = {
    nombreCompleto: 'Usuario API Smoke',
    email: randomEmail(),
    password: DEFAULT_PASSWORD
  };

  const createUserRes = await logResponse('POST /users', () => http.post('/users', managedUserPayload, authConfig));
  const managedUser = createUserRes.data && createUserRes.data.data ? createUserRes.data.data : null;
  const managedUserId = managedUser ? managedUser.id : null;

  if (managedUserId) {
    await logResponse('GET /users/{id}', () => http.get(`/users/${managedUserId}`, authConfig));
    await logResponse('PUT /users/{id}', () => http.put(`/users/${managedUserId}`, {
      nombreCompleto: `${managedUserPayload.nombreCompleto} Updated`,
      email: managedUserPayload.email,
      password: managedUserPayload.password
    }, authConfig));
  }

  // Categories
  const categoryPayload = { name: `Categoria ${Date.now()}`, description: 'Smoke category' };
  const createCategoryRes = await logResponse('POST /categories', () => http.post('/categories', categoryPayload, authConfig));
  const categoryId = createCategoryRes.data && createCategoryRes.data.data ? createCategoryRes.data.data.id : null;

  await logResponse('GET /categories', () => http.get('/categories', authConfig));
  if (categoryId) {
    await logResponse('GET /categories/{id}', () => http.get(`/categories/${categoryId}`, authConfig));
    await logResponse('PUT /categories/{id}', () => http.put(`/categories/${categoryId}`, {
      name: categoryPayload.name + ' Updated',
      description: 'Updated description'
    }, authConfig));
  }

  // Tags
  const tagPayload = { name: `tag-${Date.now()}` };
  const createTagRes = await logResponse('POST /tags', () => http.post('/tags', tagPayload, authConfig));
  const tagId = createTagRes.data && createTagRes.data.data ? createTagRes.data.data.id : null;

  await logResponse('GET /tags', () => http.get('/tags', authConfig));
  if (tagId) {
    await logResponse('GET /tags/{id}', () => http.get(`/tags/${tagId}`, authConfig));
    await logResponse('PUT /tags/{id}', () => http.put(`/tags/${tagId}`, { name: `${tagPayload.name}-updated` }, authConfig));
  }

  // Products (admin)
  const productPayload = {
    name: `Producto Smoke ${Date.now()}`,
    description: 'Producto para smoke test',
    price: 19.99,
    stock: 10,
    categoryId,
    tags: tagId ? [tagId] : []
  };

  const createProductRes = await logResponse('POST /products', () => http.post('/products', productPayload, authConfig));
  const product = createProductRes.data && createProductRes.data.data ? createProductRes.data.data : null;
  const productId = product ? product.id : null;
  const productSlug = product ? product.slug : null;

  await logResponse('GET /products (admin)', () => http.get('/products', authConfig));
  if (productId) {
    await logResponse('GET /products/{id}', () => http.get(`/products/${productId}`, authConfig));
    await logResponse('PUT /products/{id}', () => http.put(`/products/${productId}`, {
      name: productPayload.name + ' Updated',
      description: productPayload.description,
      price: 29.99,
      stock: 15
    }, authConfig));
  }

  // Public listing (uses same product dataset)
  await logResponse('GET /products (public)', () => http.get('/products', { params: { page: 1, limit: 5 } }));
  if (productId && productSlug) {
    await logResponse('GET /p/{id}-{slug}', () => http.get(`/p/${productId}-${productSlug}`));
  }

  // Orders
  if (productId) {
    const orderPayload = {
      items: [{ productId, quantity: 1 }],
      paymentMethod: 'CreditCard',
      paymentDetails: {
        cardNumber: '4111111111111111',
        cvv: '123',
        expirationMonth: '12',
        expirationYear: '2030',
        fullName: 'Smoke Tester',
        description: 'Smoke order payment',
        reference: `smoke-order-${Date.now()}`,
        currency: 'USD'
      }
    };

    const createOrderRes = await logResponse('POST /orders', () => http.post('/orders', orderPayload, authConfig));
    const order = createOrderRes.data && createOrderRes.data.data ? createOrderRes.data.data : null;

    await logResponse('GET /orders', () => http.get('/orders', { ...authConfig, params: { page: 1, limit: 10 } }));

    if (order && order.id) {
      await logResponse('GET /orders/{id}', () => http.get(`/orders/${order.id}`, authConfig));
    }
  }

  // Cleanup (best effort)
  if (productId) {
    await logResponse('DELETE /products/{id}', () => http.delete(`/products/${productId}`, authConfig));
  }
  if (managedUserId) {
    await logResponse('DELETE /users/{id}', () => http.delete(`/users/${managedUserId}`, authConfig));
  }
  if (tagId) {
    await logResponse('DELETE /tags/{id}', () => http.delete(`/tags/${tagId}`, authConfig));
  }
  if (categoryId) {
    await logResponse('DELETE /categories/{id}', () => http.delete(`/categories/${categoryId}`, authConfig));
  }

  console.log('\nSmoke test finished. Review logs above for each endpoint.');
})().catch((error) => {
  console.error('\nSmoke test aborted due to unexpected error:', error);
  process.exit(1);
});
