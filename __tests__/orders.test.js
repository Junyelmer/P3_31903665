'use strict';

jest.mock('axios', () => ({
  post: jest.fn()
}));

const request = require('supertest');
const axios = require('axios');
const app = require('../app');
const db = require('../models');

const { Product, Order, OrderItem } = db;

beforeAll(() => {
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.FAKE_PAYMENT_TOKEN = 'test_payment_token';
});

const paymentDetailsFactory = (overrides = {}) => ({
  cardNumber: '4111111111111111',
  cvv: '123',
  expirationMonth: '12',
  expirationYear: '2030',
  fullName: 'Tester Card',
  description: 'Test order payment',
  reference: `test-${Date.now()}`,
  currency: 'USD',
  ...overrides
});

const registerAndGetToken = async () => {
  const email = `test-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const res = await request(app)
    .post('/auth/register')
    .send({
      nombreCompleto: 'Tester',
      email,
      password: '12345678'
    });

  expect(res.statusCode).toBe(201);
  return res.body.data.token;
};

const createProduct = async ({ name, price = 10.0, stock = 5 }) => {
  return Product.create({
    name,
    description: 'Test product',
    price,
    stock
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('POST /orders', () => {
  it('crea la orden completa y descuenta el stock cuando el pago es exitoso', async () => {
    axios.post.mockResolvedValue({ data: { status: 'approved' } });

    const token = await registerAndGetToken();
    const product = await createProduct({ name: 'Success Product', price: 20.5, stock: 10 });

    const payload = {
      items: [
        { productId: product.id, quantity: 2 }
      ],
      paymentMethod: 'CreditCard',
      paymentDetails: paymentDetailsFactory()
    };

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toMatchObject({
      userId: expect.any(Number),
      status: 'COMPLETED'
    });
    expect(res.body.data.totalAmount).toBeDefined();
    expect(Number(res.body.data.totalAmount)).toBeCloseTo(41, 2);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(axios.post).toHaveBeenCalledTimes(1);

    await product.reload();
    expect(product.stock).toBe(8);

    const orderCount = await Order.count();
    const orderItemsCount = await OrderItem.count();
    expect(orderCount).toBe(1);
    expect(orderItemsCount).toBe(1);
  });

  it('falla si existe stock insuficiente y no modifica el resto del stock', async () => {
    axios.post.mockResolvedValue({ data: { status: 'approved' } });

    const token = await registerAndGetToken();
    const productA = await createProduct({ name: 'Low Stock', price: 15, stock: 1 });
    const productB = await createProduct({ name: 'Other Product', price: 5, stock: 5 });

    const payload = {
      items: [
        { productId: productA.id, quantity: 2 },
        { productId: productB.id, quantity: 1 }
      ],
      paymentMethod: 'CreditCard',
      paymentDetails: paymentDetailsFactory()
    };

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.data.message).toMatch(/Stock insuficiente/i);
    expect(axios.post).not.toHaveBeenCalled();

    await productA.reload();
    await productB.reload();
    expect(productA.stock).toBe(1);
    expect(productB.stock).toBe(5);
    expect(await Order.count()).toBe(0);
  });

  it('realiza rollback cuando el pago es rechazado', async () => {
    const paymentError = new Error('Pago rechazado');
    paymentError.response = { status: 402, data: { message: 'Card declined' } };
    axios.post.mockRejectedValue(paymentError);

    const token = await registerAndGetToken();
    const product = await createProduct({ name: 'Payment Failure', price: 12.34, stock: 4 });

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 2 }],
        paymentMethod: 'CreditCard',
        paymentDetails: paymentDetailsFactory()
      });

    expect(res.statusCode).toBe(402);
    expect(res.body.status).toBe('fail');
    expect(res.body.data.message).toMatch(/Card declined|Pago rechazado/i);
    expect(axios.post).toHaveBeenCalledTimes(1);

    await product.reload();
    expect(product.stock).toBe(4);
    expect(await Order.count()).toBe(0);
    expect(await OrderItem.count()).toBe(0);
  });
});

describe('Protección de rutas /orders', () => {
  it('requiere autenticación para POST /orders', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ items: [], paymentMethod: 'CreditCard', paymentDetails: paymentDetailsFactory() });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('requiere autenticación para GET /orders', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('requiere autenticación para GET /orders/:id', async () => {
    const res = await request(app).get('/orders/1');
    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('error');
  });
});
