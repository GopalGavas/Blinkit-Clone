import { useEffect, useState } from "react";
import Axios from "../../api/axios";
import { errorToast, successToast } from "../../utils/toast";

const emptyVariant = {
  label: "",
  price: "",
  stock: "",
  isDefault: false,
};

const ProductForm = ({ mode = "create", initialData = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [moreDetails, setMoreDetails] = useState("");

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [variants, setVariants] = useState([
    { ...emptyVariant, isDefault: true },
  ]);

  /* -------------------- FETCH DATA -------------------- */

  const fetchCategories = async () => {
    try {
      const res = await Axios.get("/category");
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to fetch categories");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await Axios.get("/subcategory/get", {
        params: { categoryId },
      });
      if (res.data.success) setSubCategories(res.data.data);
    } catch (err) {
      errorToast(
        err.response?.data?.message || "Failed to fetch Sub Categories"
      );
    }
  };

  /* -------------------- IMAGE UPLOAD -------------------- */

  const uploadImages = async (files) => {
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await Axios.post("/file/upload", formData);
        if (res.data.success) {
          uploaded.push(res.data.data.url);
        }
      } catch (err) {
        errorToast(
          err.response?.data?.message || "Failed to fetch Sub Categories"
        );
      }
    }

    setImages((prev) => [...prev, ...uploaded]);
  };

  /* -------------------- VARIANT HANDLERS -------------------- */

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;

    setVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (!updated.some((v) => v.isDefault)) {
        updated[0] = { ...updated[0], isDefault: true };
      }
      return updated;
    });
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (field === "isDefault") {
          return { ...v, isDefault: i === index };
        }
        if (i === index) {
          return { ...v, [field]: value };
        }
        return v;
      })
    );
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!name.trim() || !category || !subCategory) {
      errorToast("Name, category and subcategory are required");
      return;
    }

    const hasInvalidVariant = variants.some((v) => {
      const label = typeof v.label === "string" ? v.label.trim() : "";
      const price = Number(v.price);
      const stock = Number(v.stock);

      return label === "" || Number.isNaN(price) || Number.isNaN(stock);
    });

    if (hasInvalidVariant) {
      errorToast("All Variant fields are required");
      return;
    }

    const payload = {
      name: name.trim(),
      images,
      category,
      subCategory,
      description: description.trim(),
      moreDetails: moreDetails.trim(),
      variants: variants.map((v) => ({
        label: v.label.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        isDefault: !!v.isDefault,
      })),
    };

    try {
      setLoading(true);

      const res =
        mode === "create"
          ? await Axios.post("/product/create", payload)
          : await Axios.put(`/product/update/${initialData._id}`, payload);

      if (res.data.success) {
        successToast("Product Created Successfully");
        onSuccess?.();
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    fetchCategories();

    if (mode === "edit" && initialData) {
      setName(initialData.name || "");
      setImages(initialData.images || []);
      setCategory(initialData.category?._id || "");
      setSubCategory(initialData.subCategory?._id || "");
      setDescription(initialData.description || "");
      setMoreDetails(initialData.moreDetails || "");
      setVariants(
        initialData.variants.map((v) => ({
          label: v.label || "",
          price: String(v.price ?? ""),
          stock: String(v.stock ?? ""),
          isDefault: !!v.isDefault,
        }))
      );
    }
  }, [mode, initialData]);

  useEffect(() => {
    fetchSubCategories(category);
  }, [category]);

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-6">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product name"
        className="w-full border px-3 py-2 rounded"
      />

      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("");
          }}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          disabled={!category}
        >
          <option value="">Select SubCategory</option>
          {subCategories.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="file"
        multiple
        onChange={(e) => uploadImages(e.target.files)}
      />

      <div className="flex gap-2 flex-wrap">
        {images.map((img, i) => (
          <img key={i} src={img} className="h-20 w-20 object-cover rounded" />
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Variant Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Default</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">
                  <input
                    value={v.label}
                    onChange={(e) => updateVariant(i, "label", e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="radio"
                    checked={v.isDefault}
                    onChange={() => updateVariant(i, "isDefault", true)}
                  />
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => removeVariant(i)}
                    className="text-red-600"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addVariant}
          className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-sm"
        >
          + Add Variant
        </button>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="w-full border px-3 py-2 rounded"
      />

      <textarea
        value={moreDetails}
        onChange={(e) => setMoreDetails(e.target.value)}
        placeholder="More details (optional)"
        className="w-full border px-3 py-2 rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        {loading
          ? "Saving..."
          : mode === "create"
          ? "Create Product"
          : "Update Product"}
      </button>
    </div>
  );
};

export default ProductForm;
