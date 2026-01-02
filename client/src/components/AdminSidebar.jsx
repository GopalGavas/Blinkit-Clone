import { NavLink } from "react-router-dom";

const AdminSidebar = ({ closeSidebar }) => {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition ${
      isActive ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="h-full w-64 bg-white p-4">
      <h2 className="text-xl font-bold mb-6 text-green-600">Admin Panel</h2>

      <nav className="space-y-2">
        <NavLink
          to="/admin/categories"
          className={linkClass}
          onClick={closeSidebar}
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/subcategories"
          className={linkClass}
          onClick={closeSidebar}
        >
          Sub Categories
        </NavLink>
        <NavLink
          to="/admin/products"
          className={linkClass}
          onClick={closeSidebar}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={linkClass}
          onClick={closeSidebar}
        >
          Manage Orders
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
