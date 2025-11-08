'use strict';
const { generateSlug } = require('../utils/slug');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {});

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Product.belongsToMany(models.Tag, { through: 'ProductTags', foreignKey: 'productId', otherKey: 'tagId' });
  };

  // Hooks to generate slug
  Product.addHook('beforeValidate', async (product, options) => {
    if (product.name) {
      product.slug = generateSlug(product.name);
    }
  });

  return Product;
};
