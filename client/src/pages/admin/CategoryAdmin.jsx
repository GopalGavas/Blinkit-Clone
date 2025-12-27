import { useEffect, useRef, useState } from "react";
import Axios from "../../api/axios";
import { successToast, errorToast } from "../../utils/toast";
import toast from "react-hot-toast";

const CategoryAdmin = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // edit state
  const [editCategory, setEditCategory] = useState(null);
  const [originalCategory, setOriginalCategory] = useState(null);

  const fileRef = useRef(null);
  const editFileRef = useRef(null);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await Axios.get("/category");
    if (res.data.success) {
      setCategories(res.data.data);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  // Upload image (shared)
  const uploadImage = async (file, setImageState) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await Axios.post("/file/upload", formData);
    if (res.data.success) {
      setImageState(res.data.data.url);
    }
  };

  // Create category
  const handleCreateCategory = async () => {
    if (!name || !image) {
      errorToast("Name and Image are required");
      return;
    }

    setLoading(true);
    const res = await Axios.post("/category/add-category", { name, image });

    if (res.data.success) {
      successToast("Category Created Successfully");
      setName("");
      setImage("");
      fileRef.current.value = "";
      fetchCategories();
    }

    setLoading(false);
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (!editCategory || !originalCategory) return;

    const payload = {};

    if (editCategory.name !== originalCategory.name) {
      payload.name = editCategory.name;
    }

    if (editCategory.image !== originalCategory.image) {
      payload.image = editCategory.image;
    }

    if (Object.keys(payload).length === 0) {
      toast("Nothing to update", { icon: "ℹ️" });
      return;
    }

    try {
      setLoading(true);

      const res = await Axios.put(`/category/${editCategory._id}`, payload);

      if (res.data.success) {
        successToast("Category Updated");
        fetchCategories();
        setEditCategory(null);
        setOriginalCategory(null);
        if (editFileRef.current) editFileRef.current.value = "";
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to Update Category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    const res = await Axios.delete(`/category/${id}`);
    if (res.data.success) {
      successToast("Category Deleted");
      fetchCategories();
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Category Management</h1>

      {/* CREATE CATEGORY */}
      <div className="bg-white p-5 rounded-lg shadow max-w-lg space-y-4">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0], setImage)}
        />

        {image && (
          <img
            src={image}
            alt="preview"
            className="h-28 w-28 object-cover rounded border"
          />
        )}

        <button
          onClick={handleCreateCategory}
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-3 flex flex-col h-full"
          >
            {/* IMAGE */}
            <div className="aspect-[3/4] overflow-hidden rounded-lg mb-3">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* CONTENT */}
            <div className="flex flex-col flex-1">
              <p className="font-medium text-center mb-2 line-clamp-2 min-h-[3rem]">
                {cat.name}
              </p>

              {/* ACTIONS – ALWAYS BOTTOM */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => {
                    setEditCategory({ ...cat });
                    setOriginalCategory({ ...cat });
                  }}
                  className="flex-1 text-sm bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="flex-1 text-sm bg-red-600 text-white py-1.5 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-semibold">Edit Category</h2>

            <input
              type="text"
              value={editCategory.name}
              onChange={(e) =>
                setEditCategory({ ...editCategory, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />

            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                uploadImage(e.target.files[0], (url) =>
                  setEditCategory({ ...editCategory, image: url })
                )
              }
            />

            {editCategory.image && (
              <img
                src={editCategory.image}
                alt="preview"
                className="h-28 w-28 object-cover rounded border"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditCategory(null);
                  setOriginalCategory(null);
                }}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateCategory}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAdmin;
