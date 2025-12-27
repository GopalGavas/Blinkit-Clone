import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  try {
    const { name, image, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
        error: true,
        success: false,
      });
    }

    const slug = slugify(name, { lower: true });

    const existingCategory = await CategoryModel.findOne({
      $or: [{ name }, { slug }],
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
        error: true,
        success: false,
      });
    }

    const category = new CategoryModel({
      name,
      slug,
      image: image || "",
      sortOrder,
    });

    const savedCategory = await category.save();

    return res.status(201).json({
      message: "Category created successfully",
      error: false,
      success: true,
      data: savedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ status: true }).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.json({
      message: "Category list",
      error: false,
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, image, status, sortOrder } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
        error: true,
        success: false,
      });
    }

    const updateData = {
      ...(name && {
        name,
        slug: slugify(name, { lower: true }),
      }),
      ...(image && { image }),
      ...(typeof status === "boolean" && { status }),
      ...(typeof sortOrder === "number" && { sortOrder }),
    };

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Category updated successfully",
      error: false,
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
        error: true,
        success: false,
      });
    }

    const subCategoryCount = await SubCategoryModel.countDocuments({
      category: categoryId,
      status: true,
    });

    const productCount = await ProductModel.countDocuments({
      category: categoryId,
      status: true,
    });

    if (subCategoryCount > 0 || productCount > 0) {
      return res.status(400).json({
        message: "Category is in use and cannot be deleted",
        error: true,
        success: false,
      });
    }

    const deletedCategory = await CategoryModel.updateOne(
      { _id: categoryId },
      { status: false }
    );

    return res.json({
      message: "Category disabled successfully",
      error: false,
      success: true,
      data: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};
