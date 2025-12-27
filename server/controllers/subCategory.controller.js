import SubCategoryModel from "../models/subCategory.model.js";
import CategoryModel from "../models/category.model.js";
import ProductModel from "../models/product.model.js";
import slugify from "slugify";

export const createSubCategoryController = async (req, res) => {
  try {
    const { name, category, image, sortOrder } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        message: "SubCategory name and category are required",
        error: true,
        success: false,
      });
    }

    const categoryExists = await CategoryModel.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    const slug = slugify(name, { lower: true });

    const existingSubCategory = await SubCategoryModel.findOne({
      slug,
      category,
      status: true,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        message: "SubCategory already exists under this category",
        error: true,
        success: false,
      });
    }

    const subCategory = new SubCategoryModel({
      name,
      slug,
      image,
      sortOrder,
      category,
    });

    const savedSubCategory = await subCategory.save();

    return res.status(201).json({
      message: "SubCategory created successfully",
      error: false,
      success: true,
      data: savedSubCategory,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
};

export const getSubCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = {
      status: true,
    };

    if (categoryId) {
      filter.category = categoryId;
    }

    const data = await SubCategoryModel.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate({
        path: "category",
        match: { status: true },
        select: "name slug",
      });

    return res.json({
      message: "SubCategory list",
      data,
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

export const updateSubCategoryController = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { name, image, category } = req.body;

    if (!subCategoryId) {
      return res.status(400).json({
        message: "SubCategory ID is required",
        error: true,
        success: false,
      });
    }

    const subCategory = await SubCategoryModel.findOne({
      _id: subCategoryId,
      status: true,
    });

    if (!subCategory) {
      return res.status(404).json({
        message: "SubCategory not found or disabled",
        error: true,
        success: false,
      });
    }

    if (category) {
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
    }

    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
      subCategoryId,
      {
        ...(name && {
          name,
          slug: slugify(name, { lower: true }),
        }),
        ...(image && { image }),
        ...(category && { category }),
      },
      { new: true }
    );

    return res.json({
      message: "SubCategory updated successfully",
      data: updatedSubCategory,
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

export const deleteSubCategoryController = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    if (!subCategoryId) {
      return res.status(400).json({
        message: "SubCategory ID is required",
        error: true,
        success: false,
      });
    }

    const subCategory = await SubCategoryModel.findOne({
      _id: subCategoryId,
      status: true,
    });

    if (!subCategory) {
      return res.status(404).json({
        message: "SubCategory not found or already deleted",
        error: true,
        success: false,
      });
    }

    const productCount = await ProductModel.countDocuments({
      subCategory: subCategoryId,
      status: true,
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: "Cannot delete subcategory linked with products",
        error: true,
        success: false,
      });
    }

    await SubCategoryModel.findByIdAndUpdate(subCategoryId, {
      status: false,
    });

    return res.json({
      message: "SubCategory deleted successfully",
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
