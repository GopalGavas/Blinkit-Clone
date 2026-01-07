/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";
import CartDrawer from "./CartDrawer";
import Axios from "../api/axios";
import BlinkitLogo from "../assets/blinkit-logo.svg";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalQuantity } = useCart();

  const [showMenu, setShowMenu] = useState(false);
  const [openCart, setOpenCart] = useState(false);

  /* ================= SEARCH STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  /* ================= CLOSE STATES ON LOGOUT ================= */
  useEffect(() => {
    if (!isAuthenticated) {
      setOpenCart(false);
      setShowMenu(false);
    }
  }, [isAuthenticated]);

  /* ================= CLICK OUTSIDE USER MENU ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= CLICK OUTSIDE SEARCH ================= */
  useEffect(() => {
    const handleSearchClose = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleSearchClose);
    return () => document.removeEventListener("mousedown", handleSearchClose);
  }, []);

  /* ================= SEARCH API (DEBOUNCED) ================= */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await Axios.get(
          `/product?search=${encodeURIComponent(searchTerm)}&limit=5`
        );

        if (res.data.success) {
          setSearchResults(res.data.data);
          setShowSearch(true);
        }
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleLogout = async () => {
    await logout();
    setOpenCart(false);
    setShowMenu(false);
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}

            <Link to="/">
              <img
                src={BlinkitLogo}
                alt="blinkit-logo"
                className="h-16 sm:h-20 w-16 sm:w-20 object-contain"
              />
            </Link>

            {/* ================= SEARCH ================= */}
            <div className="flex-1 mx-4 relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-500"
              />

              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border rounded shadow-md mt-1 z-50">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setSearchTerm("");
                        setShowSearch(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-sm font-medium">
                        {product.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ================= CART + USER ================= */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <button className="relative" onClick={() => setOpenCart(true)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h14l-1.35 6.75a1 1 0 01-.99.75H6a1 1 0 01-1-.75L3 6H21"
                    />
                  </svg>

                  {totalQuantity > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((p) => !p)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.name?.[0]?.toUpperCase()
                      )}
                    </div>

                    <span className="hidden sm:block">{user?.name}</span>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow border z-50">
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {user?.role === "ADMIN"
                            ? "Administrator"
                            : "Customer"}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        My Orders
                      </Link>

                      {user?.role === "ADMIN" && (
                        <>
                          <div className="border-t my-1"></div>
                          <Link
                            to="/admin/categories"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Categories
                          </Link>
                          <Link
                            to="/admin/subcategories"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            SubCategories
                          </Link>
                          <Link
                            to="/admin/products"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Products
                          </Link>
                          <Link
                            to="/admin/orders"
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Manage Orders
                          </Link>
                        </>
                      )}

                      <div className="border-t mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
};

export default Navbar;
