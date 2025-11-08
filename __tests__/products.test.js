const request = require('supertest');
const app = require('../app');
const db = require('../models');

beforeAll(async () => {
  // Sync DB and create some test data
  await db.sequelize.sync({ force: true });

  const Category = db.Category;
  const Tag = db.Tag;
  const Product = db.Product;

  const cat = await Category.create({ name: 'TestCat', description: 'Desc' });
  const tag1 = await Tag.create({ name: 'T1' });
  const tag2 = await Tag.create({ name: 'T2' });

  const p = await Product.create({ name: 'Test Product', description: 'Desc', price: 9.99, stock: 5, categoryId: cat.id });
  await p.setTags([tag1.id, tag2.id]);
});

afterAll(async () => {
  await db.sequelize.close();
});

test('GET /products should return list with meta', async () => {
  const res = await request(app).get('/products').expect(200);
  expect(res.body.status).toBe('success');
  expect(res.body.meta).toHaveProperty('total');
});

test('GET /p/:id-:slug returns 200 when slug correct', async () => {
  const Product = db.Product;
  const p = await Product.findOne({ where: { name: 'Test Product' } });
  const res = await request(app).get(`/p/${p.id}-${p.slug}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.status).toBe('success');
});

test('GET /p/:id-:slug returns 301 when slug incorrect', async () => {
  const Product = db.Product;
  const p = await Product.findOne({ where: { name: 'Test Product' } });
  const res = await request(app).get(`/p/${p.id}-wrong-slug`);
  expect(res.statusCode).toBe(301);
  expect(res.headers).toHaveProperty('location');
});

test('POST /products management endpoint should fail without token', async () => {
  const res = await request(app).post('/products').send({ name: 'X' });
  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty('status');
});
