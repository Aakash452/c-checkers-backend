const express = require("express");
const Product = require("../scheme/product_scheme");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// For the path to upload the image 
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || "Uncategorized"; // Default category if missing
    const categoryPath = path.join(uploadDir, category);

    // ✅ Ensure the category folder exists
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true }); // Create folder if it doesn't exist
    }

    cb(null, categoryPath); // Save image inside category folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage });

// @route   POST /api/products/add
// @desc    Add a new product
// @access  Public (For now)


router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, brand } = req.body;

    const imagePath = `${req.file.filename}`; // Store only the image path

    const newProduct = new Product({
      name,
      price,
      description,
      category,
      brand,
      Image: imagePath, // Store the image path in MongoDB
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get the product details

router.get("/", async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get the particular products

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    console.log(products)

    if (!products.length) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete a particular Product from the Database along with the Image

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Construct the image path
    const imagePath = path.join(__dirname, "../uploads", product.category, product.Image);

    // ✅ Check if the image exists and delete it
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`✅ Image deleted: ${imagePath}`);
    } else {
      console.log("⚠️ Image file not found, skipping deletion.");
    }

    // ✅ Delete product from MongoDB
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product and associated image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Retrieve the Image that is Uploaded

router.get("/image/:category/:filename", (req, res) => {
  const { category, filename } = req.params;
  const imagePath = path.join(__dirname, "../uploads", category, filename);

  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ error: "Image not found" });
    }
  });
});
module.exports = router;
