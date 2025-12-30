import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../api/axios";
import ProductCard from "../components/ProductCard";
import { addToCart } from "../services/cartApi";

const SubCategoryPage = () => {
  const { categoryId } = useParams(); // category _id from URL

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
        setSelectedSubcategory(res.data.data[0] || null); // select first
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
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

      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchSubcategories();
  }, [categoryId]);

  useEffect(() => {
    if (selectedSubcategory) {
      fetchProducts(selectedSubcategory);
    }
  }, [selectedSubcategory]);

  /* ================= UI ================= */

  return (
    <main className="max-w-[1200px] mx-auto flex gap-4 mt-4 px-3 sm:px-0">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 h-[80vh] overflow-y-auto sticky top-4">
        {subcategories.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-10 px-4">
            No subcategories available
          </div>
        ) : (
          subcategories.map((sub) => (
            <div
              key={sub._id}
              onClick={() => setSelectedSubcategory(sub)}
              className={`flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 ${
                selectedSubcategory?._id === sub._id ? "bg-gray-100" : ""
              }`}
            >
              <img
                src={sub.image}
                alt={sub.name}
                className="w-12 h-12 object-cover rounded"
              />
              <span className="text-sm font-medium">{sub.name}</span>
            </div>
          ))
        )}
      </aside>

      {/* ================= PRODUCTS ================= */}
      <section className="flex-1 bg-gray-50 p-4 rounded-lg">
        {subcategories.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">
            No products available
          </p>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {new Array(8).fill(null).map((_, index) => (
              <div
                key={index}
                className="w-full h-52 bg-gray-200 animate-pulse rounded"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={(product, variant) => {
                  addToCart({
                    productId: product._id,
                    variantId: variant._id,
                    quantity: 1,
                  });
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
