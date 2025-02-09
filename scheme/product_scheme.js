const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subCategory: { type: String, trim: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, min: 0 , default : 0 },
  sku: { type: String, unique: true, trim: true },
  Image: { type: String },
});

// Auto-generate SKU before saving a product
ProductSchema.pre("save", function (next) {
  if (!this.sku) {
    this.sku = `${this.brand.substring(0, 3).toUpperCase()}-${this.subCategory ? this.subCategory.substring(0, 3).toUpperCase() : "GEN"}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
