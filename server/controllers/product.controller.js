import ProductModel from "../models/product.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import slugify from "slugify";

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      images,
      category,
      subCategory,
      variants,
      description,
      moreDetails,
    } = req.body;

    /* Basic validations */
    if (!name || !category || !subCategory || !variants?.length) {
      return res.status(400).json({
        message: "Missing required fields",
        error: true,
        success: false,
      });
    }

    /* Check category */
    const categoryExists = await CategoryModel.findOne({
      _id: category,
      status: true,
    });

    if (!categoryExists) {
      return res.status(400).json({
        message: "Invalid category",
        error: true,
        success: false,
      });
    }

    /* Check subcategory */
    const subCategoryExists = await SubCategoryModel.findOne({
      _id: subCategory,
      status: true,
    });

    if (!subCategoryExists) {
      return res.status(400).json({
        message: "Invalid subcategory",
        error: true,
        success: false,
      });
    }

    /* Slug generation */
    const slug = slugify(name, { lower: true });

    const existingProduct = await ProductModel.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({
        message: "Product already exists",
        error: true,
        success: false,
      });
    }

    /* Default variant enforcement */
    const defaultVariants = variants.filter((v) => v.isDefault);

    if (defaultVariants.length === 0) {
      variants[0].isDefault = true;
    }

    if (defaultVariants.length > 1) {
      return res.status(400).json({
        message: "Only one default variant is allowed",
        error: true,
        success: false,
      });
    }

    /* Create product */
    const product = new ProductModel({
      name,
      slug,
      images,
      category,
      subCategory,
      variants,
      description,
      moreDetails,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      message: "Product created successfully",
      data: savedProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const query = {
      status: true,
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (minPrice || maxPrice) {
      query["variants.price"] = {};
      if (minPrice) query["variants.price"].$gte = Number(minPrice);
      if (maxPrice) query["variants.price"].$lte = Number(maxPrice);
    }

    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { "variants.price": 1 };
    if (sort === "price_desc") sortQuery = { "variants.price": -1 };

    const skip = (page - 1) * limit;

    const products = await ProductModel.find(query)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await ProductModel.countDocuments(query);

    return res.json({
      message: "Product list",
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getProductsByCategoryController = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    const category = await CategoryModel.findOne({
      slug: categorySlug,
      status: true,
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      category: category._id,
      status: true,
    }).populate("subCategory", "name slug");

    return res.json({
      message: "Products by category",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getProductsByCategoryAndSubController = async (req, res) => {
  try {
    const { categorySlug, subCategorySlug } = req.params;

    const category = await CategoryModel.findOne({ slug: categorySlug });
    const subCategory = await SubCategoryModel.findOne({
      slug: subCategorySlug,
    });

    if (!category || !subCategory) {
      return res.status(404).json({
        message: "Category or SubCategory not found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      category: category._id,
      subCategory: subCategory._id,
      status: true,
    });

    return res.json({
      message: "Products list",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await ProductModel.findOne({
      slug,
      status: true,
    })
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Product details",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    const updated = await ProductModel.findByIdAndUpdate(productId, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Product updated",
      data: updated,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const { productId } = req.params;

    await ProductModel.findByIdAndUpdate(productId, {
      status: false,
    });

    return res.json({
      message: "Product deleted",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};
