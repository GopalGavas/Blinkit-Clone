import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalQuantity } = useCart(); // ✅ only totalQuantity needed
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setShowMenu(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-green-600">
            BlinkIt
          </Link>

          {/* Search */}
          <div className="flex-1 mx-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border rounded px-4 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Cart + User */}
          <div className="flex items-center gap-4">
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

              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((p) => !p)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user?.name}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow border">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role === "ADMIN" ? "Administrator" : "Customer"}
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
