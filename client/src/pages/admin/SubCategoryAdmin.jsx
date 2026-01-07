import { useEffect, useRef, useState } from "react";
import Axios from "../../api/axios";
import { successToast, errorToast } from "../../utils/toast";
import toast from "react-hot-toast";

const SubCategoryAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // CREATE FORM
  const [createForm, setCreateForm] = useState({
    name: "",
    category: "",
    image: "",
  });

  // EDIT FORM
  const [editForm, setEditForm] = useState(null);
  const [originalEditForm, setOriginalEditForm] = useState(null);

  const createFileRef = useRef(null);
  const editFileRef = useRef(null);

  /* ---------------- FETCH DATA ---------------- */

  const fetchCategories = async () => {
    const res = await Axios.get("/category");
    if (res.data.success) setCategories(res.data.data);
  };

  const fetchSubCategories = async (categoryId = "") => {
    const url = categoryId
      ? `/subcategory/get?categoryId=${categoryId}`
      : `/subcategory/get`;

    const res = await Axios.get(url);
    if (res.data.success) setSubCategories(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  /* ---------------- IMAGE UPLOAD ---------------- */

  const uploadImage = async (file, cb) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await Axios.post("/file/upload", formData);
    if (res.data.success) cb(res.data.data.url);
  };

  /* ---------------- CREATE ---------------- */

  const handleCreate = async () => {
    const { name, category, image } = createForm;

    if (!name || !category || !image) {
      errorToast("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await Axios.post("/subcategory/create", createForm);

      if (res.data.success) {
        successToast("SubCategory created successfully");
        setCreateForm({ name: "", category: "", image: "" });
        createFileRef.current.value = "";
        fetchSubCategories(filterCategory);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE ---------------- */

  const handleUpdate = async () => {
    if (!editForm || !originalEditForm) return;

    const payload = {};

    if (editForm.name !== originalEditForm.name) payload.name = editForm.name;
    if (editForm.image !== originalEditForm.image)
      payload.image = editForm.image;
    if (editForm.category !== originalEditForm.category)
      payload.category = editForm.category;

    if (Object.keys(payload).length === 0) {
      toast("No changes detected", { icon: "ℹ️" });
      return;
    }

    try {
      setLoading(true);
      const res = await Axios.put(
        `/subcategory/update/${editForm._id}`,
        payload
      );

      if (res.data.success) {
        successToast("SubCategory Updated");
        setEditForm(null);
        setOriginalEditForm(null);
        editFileRef.current.value = "";
        fetchSubCategories(filterCategory);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to update subcategory");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;

    try {
      const res = await Axios.delete(`/subcategory/delete/${id}`);
      if (res.data.success) {
        successToast("SubCategory deleted successfully");
        fetchSubCategories(filterCategory);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Unable to delete subcategory");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">SubCategory Management</h1>

      {/* CREATE */}
      <div className="bg-white p-4 rounded-lg shadow max-w-xl space-y-3">
        <input
          placeholder="Subcategory name"
          value={createForm.name}
          onChange={(e) =>
            setCreateForm({ ...createForm, name: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        <select
          value={createForm.category}
          onChange={(e) =>
            setCreateForm({ ...createForm, category: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          ref={createFileRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            uploadImage(e.target.files[0], (url) =>
              setCreateForm({ ...createForm, image: url })
            )
          }
        />

        {createForm.image && (
          <img src={createForm.image} className="h-20 rounded" />
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Create SubCategory
        </button>
      </div>

      {/* FILTER */}
      <select
        value={filterCategory}
        onChange={(e) => {
          setFilterCategory(e.target.value);
          fetchSubCategories(e.target.value);
        }}
        className="border p-2 rounded"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* TABLE WITH SCROLLABLE CONTAINER */}
      <div className="bg-white rounded shadow">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-center sticky top-0 z-10">
              <tr>
                <th className="p-2">Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {subCategories.map((s) => (
                <tr key={s._id} className="border-t align-middle">
                  <td className="p-2 flex justify-center">
                    <img src={s.image} className="h-12 rounded" />
                  </td>
                  <td>{s.name}</td>
                  <td>{s.category?.name}</td>
                  <td className="p-2">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditForm(s);
                          setOriginalEditForm(s);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-5 w-[90%] max-w-md rounded space-y-3">
            <input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full border p-2 rounded"
            />

            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
              className="w-full border p-2 rounded"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                uploadImage(e.target.files[0], (url) =>
                  setEditForm({ ...editForm, image: url })
                )
              }
            />

            <img src={editForm.image} className="h-20 rounded" />

            <div className="flex gap-2">
              <button
                onClick={() => setEditForm(null)}
                className="border flex-1 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white flex-1 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryAdmin;
