import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Axios from "../api/axios";

// HERO IMAGES
import heroBanner from "../assets/hero-banner-1.jpg";
import pharmacy from "../assets/pharmacy-WEB.jpg";
import petCare from "../assets/Pet-Care_WEB.jpg";
import babyCare from "../assets/babycare-WEB.jpg";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await Axios.get("/category");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto">
      {/* ================= HERO SECTION ================= */}
      {/* ================= HERO SECTION ================= */}
      <section className="mt-2">
        {/* HERO BANNER (NO horizontal padding on desktop) */}
        <div className="max-w-[1000px] mx-auto">
          <Link to="#">
            <img
              src={heroBanner}
              alt="Hero Banner"
              className="w-full sm:rounded-lg"
            />
          </Link>
        </div>

        {/* HERO CARDS (HAS horizontal padding like original CSS) */}
        {/* HERO CARDS */}
        <div className="max-w-[1000px] mx-auto px-3 mt-3">
          <div className="flex gap-5 sm:gap-4">
            <div className="w-[240px]">
              <Link to="#">
                <img
                  src={pharmacy}
                  alt="Pharmacy"
                  className="w-full sm:rounded-md"
                />
              </Link>
            </div>

            <div className="w-[240px]">
              <Link to="#">
                <img
                  src={petCare}
                  alt="Pet Care"
                  className="w-full sm:rounded-md"
                />
              </Link>
            </div>

            <div className="w-[240px]">
              <Link to="#">
                <img
                  src={babyCare}
                  alt="Baby Care"
                  className="w-full sm:rounded-md"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES GRID ================= */}
      <section className="mt-3">
        {/* SAME SHARED CONTAINER */}
        <div className="max-w-[1000px] mx-auto px-3 sm:px-0">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {loading
              ? new Array(10)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="w-full h-20 bg-gray-200 animate-pulse rounded"
                    />
                  ))
              : categories.map((category) => (
                  <div
                    key={category._id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/subcategory/${category._id}`)}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full object-contain"
                    />
                  </div>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
