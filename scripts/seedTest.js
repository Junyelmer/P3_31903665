"use strict";

/**
 * Script de ayuda para poblar la base con un usuario de prueba y varios productos.
 * Úsalo en desarrollo: `node ./scripts/seedTest.js` o `npm run seed:test`.
 */

const db = require('../models');

async function main() {
  try {
  await db.sequelize.authenticate();
  console.log('Conectado a la base de datos.');

  // Asegurarse de que las tablas existen: crea las tablas basadas en los modelos si no existen.
  // Usamos sync() sin force para no eliminar datos existentes.
  await db.sequelize.sync();
  console.log('Sincronización de modelos completada (tablas creadas si no existían).');

    const { User, Category, Tag, Product } = db;

    // 1) Crear usuario de prueba (si no existe)
    const [user, createdUser] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        nombreCompleto: 'Usuario de Prueba',
        email: 'test@example.com',
        password: 'password123'
      }
    });

    if (createdUser) console.log('Usuario de prueba creado: test@example.com / password123');
    else console.log('Usuario de prueba ya existe: test@example.com');

    // 2) Crear categorías y tags de prueba
    const categoriesData = [
      { name: 'Figuras', description: 'Figuras de colección' },
      { name: 'Vinilos', description: 'Discos de vinilo' }
    ];

    const createdCategories = [];
    for (const c of categoriesData) {
      const [cat] = await Category.findOrCreate({ where: { name: c.name }, defaults: c });
      createdCategories.push(cat);
    }

    const tagsData = ['Edición Limitada', 'Retro', '1/6'].map(name => ({ name }));
    const createdTags = [];
    for (const t of tagsData) {
      const [tag] = await Tag.findOrCreate({ where: { name: t.name }, defaults: t });
      createdTags.push(tag);
    }

    // 3) Crear productos de ejemplo
    const productsData = [
      {
        name: 'Figura Genial',
        description: 'Figura edición limitada, ideal para coleccionistas.',
        price: 49.99,
        stock: 10,
        sku: 'FIG-001',
        brand: 'Acme',
        categoryName: 'Figuras',
        tagNames: ['Edición Limitada', '1/6']
      },
      {
        name: 'Vinilo Retro',
        description: 'Vinilo clásico en excelente estado.',
        price: 29.99,
        stock: 5,
        sku: 'VIN-001',
        brand: 'OldSound',
        categoryName: 'Vinilos',
        tagNames: ['Retro']
      },
      {
        name: 'Figura Común',
        description: 'Figura asequible y bonita.',
        price: 19.99,
        stock: 25,
        sku: 'FIG-002',
        brand: 'Generic',
        categoryName: 'Figuras',
        tagNames: []
      }
    ];

    for (const p of productsData) {
      const category = createdCategories.find(c => c.name === p.categoryName);
      const existing = await Product.findOne({ where: { name: p.name } });
      let product;
      if (!existing) {
        product = await Product.create({
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          sku: p.sku,
          brand: p.brand,
          categoryId: category ? category.id : null
        });
        console.log(`Producto creado: ${p.name}`);
      } else {
        product = existing;
        console.log(`Producto ya existe: ${p.name}`);
      }

      if (Array.isArray(p.tagNames) && p.tagNames.length) {
        const tagIds = createdTags.filter(t => p.tagNames.includes(t.name)).map(t => t.id);
        if (tagIds.length) await product.setTags(tagIds);
      }

      // Recuperar producto con Category y Tags para mostrar la info completa
      const productFull = await Product.findByPk(product.id, { include: [Category, Tag] });
      console.log('Producto (con category y tags):');
      console.log(JSON.stringify(productFull.toJSON(), null, 2));
    }

    console.log('Población de datos terminada.');
    process.exit(0);
  } catch (error) {
    console.error('Error en seedTest:', error);
    process.exit(1);
  }
}

main();
