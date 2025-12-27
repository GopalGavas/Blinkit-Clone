import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import Axios from "../api/axios";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch cart count
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await Axios.get("/cart");
        if (res.data.success) setCartCount(res.data.data.length);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCart();
  }, []);

  const handleLogout = () => {
    logout(); // your context logout
    navigate("/login");
    setShowMenu(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600">
            BlinkIt
          </Link>

          {/* Search Bar */}
          <div className="flex-1 mx-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* User & Cart */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
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
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                {/* Trigger */}
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="flex items-center gap-2 text-gray-700 font-medium"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.[0]?.toUpperCase()
                    )}
                  </div>

                  <span className="hidden sm:block">{user?.name} </span>
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role === "ADMIN" ? "Administrator" : "Customer"}
                      </p>
                    </div>

                    {/* User Links */}
                    <div className="py-1">
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
                    </div>

                    {/* Admin Links */}
                    {user?.role === "ADMIN" && (
                      <>
                        <div className="border-t my-1"></div>
                        <div className="py-1">
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
                        </div>
                      </>
                    )}

                    {/* Logout */}
                    <div className="border-t">
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
  );
};

export default Navbar;
