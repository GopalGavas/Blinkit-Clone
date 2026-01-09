import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "../api/axios";
import ProductCard from "./ProductCard";
import { errorToast } from "../utils/toast";

const MAX_ROWS = 7;
const PRODUCTS_PER_ROW = 10;
const CARD_WIDTH = 180; // px (desktop-safe)

const HomeProductRows = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductRows();
  }, []);

  const fetchProductRows = async () => {
    try {
      const res = await Axios.get("/product", { params: { limit: 200 } });
      if (!res.data.success) return;

      const products = res.data.data || [];
      const categoryMap = {};

      products.forEach((product) => {
        const cat = product.category;
        if (!cat?._id) return;

        if (!categoryMap[cat._id]) {
          categoryMap[cat._id] = {
            category: cat,
            products: [],
          };
        }

        categoryMap[cat._id].products.push(product);
      });

      const categoryRows = Object.values(categoryMap)
        .filter((c) => c.products.length > 0)
        .sort((a, b) => b.products.length - a.products.length)
        .slice(0, MAX_ROWS)
        .map((row) => ({
          ...row,
          products: row.products.slice(0, PRODUCTS_PER_ROW),
        }));

      setRows(categoryRows);
    } catch (err) {
      errorToast(
        err.response?.data?.message || "Failed to load home products rows"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || rows.length === 0) return null;

  return (
    <section className="mt-6">
      {/* SAME ALIGNMENT AS HERO + CATEGORY GRID */}
      <div className="max-w-[1000px] mx-auto px-3 sm:px-0 space-y-10">
        {rows.map((row) => (
          <ProductRow
            key={row.category._id}
            row={row}
            onSeeAll={() => navigate(`/subcategory/${row.category._id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeProductRows;

/* ================= ROW COMPONENT ================= */

const ProductRow = ({ row, onSeeAll }) => {
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -CARD_WIDTH * 4 : CARD_WIDTH * 4,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateScrollButtons();
  }, [row.products.length]);

  return (
    <div className="space-y-3">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">
          {row.category.name}
        </h2>

        <button
          onClick={onSeeAll}
          className="text-sm text-green-600 font-medium hover:underline"
        >
          See all
        </button>
      </div>

      {/* SCROLLER */}
      <div className="relative">
        {/* LEFT ARROW */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10
                       w-8 h-8 bg-green-600 text-white shadow rounded-full
                       items-center justify-center"
          >
            ‹
          </button>
        )}

        {/* PRODUCTS */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide py-2"
        >
          {row.products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0"
              style={{ width: CARD_WIDTH }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* RIGHT ARROW */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10
                       w-8 h-8 bg-green-600 text-white shadow rounded-full
                       items-center justify-center"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
};
