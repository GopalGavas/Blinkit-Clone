import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { errorToast } from "../utils/toast";

const SubCategoryPage = () => {
  const { categoryId } = useParams();
  const { addItem } = useCart();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH SUBCATEGORIES ================= */
  const fetchSubcategories = async () => {
    try {
      const res = await Axios.get(`/subcategory/get?categoryId=${categoryId}`);
      if (res.data.success) {
        setSubcategories(res.data.data);
        setSelectedSubcategory(res.data.data[0] || null);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Error fetching subcategories");
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (subcategory) => {
    if (!subcategory) return;
    setLoading(true);
    try {
      const categorySlug = subcategory.category.slug;
      const subCategorySlug = subcategory.slug;
      const res = await Axios.get(
        `/product/${categorySlug}/${subCategorySlug}`
      );
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      errorToast(err.response?.data?.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  useEffect(() => {
    if (selectedSubcategory) fetchProducts(selectedSubcategory);
  }, [selectedSubcategory]);

  return (
    <main className="max-w-[1200px] mx-auto mt-4 px-3 sm:px-0 flex gap-3">
      {/* ================= SIDEBAR ================= */}
      <aside
        className="
          flex-shrink-0
          border-r border-gray-200
          overflow-y-auto
          sticky top-4
          py-2
          h-[65vh] sm:h-[75vh]
          w-[110px] sm:w-[160px] md:w-[220px]
        "
      >
        {subcategories.length === 0 ? (
          <div className="text-xs text-gray-500 text-center mt-4 px-2">
            No subcategories available
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-1">
            {subcategories.map((sub) => (
              <div
                key={sub._id}
                onClick={() => setSelectedSubcategory(sub)}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 cursor-pointer rounded hover:bg-gray-100 ${
                  selectedSubcategory?._id === sub._id ? "bg-gray-100" : ""
                }`}
              >
                <img
                  src={sub.image}
                  alt={sub.name}
                  className="
                    w-8 h-8
                    sm:w-10 sm:h-10
                    md:w-12 md:h-12
                    object-cover rounded
                  "
                />
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center sm:text-left">
                  {sub.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ================= PRODUCTS ================= */}
      <section className="flex-1 bg-gray-50 p-2 sm:p-4 rounded-lg overflow-x-hidden">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {new Array(8).fill(null).map((_, index) => (
              <div
                key={index}
                className="w-full h-44 sm:h-52 bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={(product, variant) => {
                  addItem({
                    productId: product._id,
                    variantId: variant._id,
                    quantity: 1,
                  });
                  toast.success("Added to cart");
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SubCategoryPage;
