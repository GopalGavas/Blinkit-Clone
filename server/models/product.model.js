import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
  },

  discount: {
    type: {
      type: String,
      enum: ["PERCENT", "FLAT"],
      default: null,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  isDefault: {
    type: Boolean,
    default: false,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },

    variants: {
      type: [variantSchema],
      validate: {
        validator: function (variants) {
          return variants.length > 0;
        },
        message: "Product must have at least one variant",
      },
    },

    description: {
      type: String,
      default: "",
    },

    moreDetails: {
      type: Object,
      default: {},
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Text search index */
productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 5 } }
);

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;
