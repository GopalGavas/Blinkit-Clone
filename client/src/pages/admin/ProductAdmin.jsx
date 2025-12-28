import { useEffect, useState } from "react";
import Axios from "../../api/axios";
import ProductForm from "./ProductForm";
import { errorToast } from "../../utils/toast";

const LIMIT = 10;

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  /* ---------------- FETCH PRODUCTS ---------------- */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await Axios.get("/product", {
        params: {
          page,
          limit: LIMIT,
          search: search || undefined,
          category: category || undefined,
          subCategory: subCategory || undefined,
        },
      });

      if (res.data.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CATEGORY DATA ---------------- */

  const fetchCategories = async () => {
    try {
      const res = await Axios.get("/category");
      if (res.data.success) setCategories(res.data.data);
    } catch {
      errorToast("Failed to fetch categories");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await Axios.get("/subcategory/get", {
        params: { categoryId },
      });
      if (res.data.success) setSubCategories(res.data.data);
    } catch {
      errorToast("Failed to fetch sub categories");
    }
  };

  /* ---------------- DELETE PRODUCT ---------------- */

  const handleDelete = async (productId) => {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      await Axios.delete(`/product/delete/${productId}`);
      fetchProducts();
    } catch {
      errorToast("Failed to delete product");
    }
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) fetchSubCategories(category);
    else setSubCategories([]);
  }, [category]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, subCategory]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded shadow flex flex-col lg:flex-row gap-4">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded flex-1"
        />

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("");
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={subCategory}
          onChange={(e) => {
            setSubCategory(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
          disabled={!category}
        >
          <option value="">All Sub Categories</option>
          {subCategories.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center py-10">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const totalStock = product.variants?.reduce(
              (sum, v) => sum + (v.stock || 0),
              0
            );

            let stockStatus = "in";
            if (totalStock === 0) stockStatus = "out";
            else if (totalStock <= 5) stockStatus = "low";

            return (
              <div
                key={product._id}
                className="relative bg-white rounded-lg shadow p-3 flex flex-col h-full"
              >
                {/* STOCK BADGE */}
                {stockStatus === "out" && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}

                {stockStatus === "low" && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Low ({totalStock})
                  </span>
                )}

                {/* IMAGE */}
                <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      className="w-full h-full object-cover"
                      alt={product.name}
                    />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex flex-col flex-1">
                  <div className="space-y-1">
                    <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {product.category?.name} / {product.subCategory?.name}
                    </p>

                    <p className="text-green-600 font-semibold text-sm">
                      ₹{product.variants?.[0]?.price ?? "--"}
                    </p>

                    <p
                      className={`text-xs font-medium ${
                        stockStatus === "out"
                          ? "text-red-600"
                          : stockStatus === "low"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      Stock: {totalStock}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-green-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>

            <ProductForm
              mode="create"
              onSuccess={() => {
                setShowCreate(false);
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>

            <ProductForm
              mode="edit"
              initialData={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;
