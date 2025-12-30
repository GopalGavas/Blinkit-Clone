import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "../api/axios";
import { errorToast } from "../utils/toast";

import clockIcon from "../assets/clock-icon.png";
import superfastDelivery from "../assets/10_minute_delivery.png";
import bestPrices from "../assets/Best_Prices_Offers.png";
import wideAssortment from "../assets/Wide_Assortment.png";

const SingleProduct = () => {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  /* ---------------- FETCH PRODUCT ---------------- */

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await Axios.get(`/product/${slug}`);
      if (res.data.success) {
        const data = res.data.data;
        setProduct(data);

        setActiveImage(data.images?.[0] || "");
        const defaultVariant =
          data.variants.find((v) => v.isDefault) || data.variants[0];
        setSelectedVariant(defaultVariant);
      }
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return <p className="text-center py-20">Loading...</p>;
  }

  if (!product) return null;

  const isOutOfStock = selectedVariant?.stock === 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* ---------------- IMAGE SECTION ---------------- */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="w-full max-w-[350px] bg-white rounded-lg overflow-hidden">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-14 h-14 border rounded overflow-hidden ${
                  activeImage === img ? "border-green-600" : "border-gray-300"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- PRODUCT DETAILS ---------------- */}
        <div className="flex-[1.2] space-y-4">
          {/* Breadcrumb */}
          <p className="text-xs text-gray-500">
            Home / {product.category?.name} / {product.subCategory?.name}
          </p>

          <h1 className="text-lg font-semibold text-gray-800">
            {product.name}
          </h1>

          {/* Delivery Time */}
          <div className="inline-flex items-center gap-1 bg-gray-100 text-[10px] px-2 py-1 rounded">
            <img src={clockIcon} className="w-3" />8 mins
          </div>

          {/* ---------------- VARIANTS ---------------- */}
          <div className="pt-4">
            <p className="text-sm font-medium mb-2">Select Unit</p>

            <div className="flex gap-3 flex-wrap">
              {product.variants.map((variant) => (
                <button
                  key={variant._id}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                  className={`border rounded px-5 py-2 text-sm flex flex-col items-center ${
                    selectedVariant?._id === variant._id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300"
                  } ${
                    variant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>{variant.label}</span>
                  <span className="font-semibold">₹{variant.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ---------------- PRICE & CART ---------------- */}
          <div className="flex justify-between items-center pt-6">
            <div>
              <p className="text-lg font-bold text-gray-800">
                ₹{selectedVariant?.price}
              </p>
              <p className="text-xs text-gray-500">(inclusive of all taxes)</p>

              {isOutOfStock && (
                <p className="text-xs text-red-500 mt-1">Out of stock</p>
              )}
            </div>

            <button
              disabled={isOutOfStock}
              className={`px-6 py-2 rounded font-semibold text-sm ${
                isOutOfStock
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Add to cart
            </button>
          </div>

          {/* ---------------- WHY SHOP ---------------- */}
          <div className="pt-8 space-y-5">
            <h3 className="font-semibold text-gray-800">
              Why shop from Blinkit?
            </h3>

            <div className="flex gap-4">
              <img src={superfastDelivery} className="w-10 h-10" />
              <div>
                <p className="font-medium text-sm">Superfast Delivery</p>
                <p className="text-xs text-gray-500">
                  Get your order delivered at the earliest
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <img src={bestPrices} className="w-10 h-10" />
              <div>
                <p className="font-medium text-sm">Best Prices & Offers</p>
                <p className="text-xs text-gray-500">
                  Best price destination with offers
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <img src={wideAssortment} className="w-10 h-10" />
              <div>
                <p className="font-medium text-sm">Wide Assortment</p>
                <p className="text-xs text-gray-500">
                  Choose from 5000+ products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
