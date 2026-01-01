import { useEffect, useState } from "react";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/addressApi";

const AddressSection = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    delivery_mobile: "",
  });

  const [editingId, setEditingId] = useState(null);

  /* ---------------- FETCH ADDRESSES ---------------- */
  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateAddress(editingId, form);
      } else {
        await addAddress(form);
      }

      setForm({
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
        delivery_mobile: "",
      });
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      console.error("Address save failed", err);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (address) => {
    setEditingId(address._id);
    setForm({
      address_line: address.address_line,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      delivery_mobile: address.delivery_mobile,
    });
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      fetchAddresses(); // re-fetch list
    } catch (err) {
      console.error("Failed to set default address", err);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-lg font-semibold mb-4">My Addresses</h2>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <input
          placeholder="Address line"
          value={form.address_line}
          onChange={(e) => setForm({ ...form, address_line: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Pincode"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Mobile"
          value={form.delivery_mobile}
          onChange={(e) =>
            setForm({ ...form, delivery_mobile: e.target.value })
          }
          className="border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded mb-6"
      >
        {editingId ? "Update Address" : "Add Address"}
      </button>

      {/* LIST */}
      {loading ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500">No addresses added</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="border rounded p-3 flex justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {addr.address_line}, {addr.city}
                </p>
                <p className="text-xs text-gray-500">
                  {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-gray-500">
                  {addr.country} | {addr.delivery_mobile}
                </p>

                {addr.isDefault ? (
                  <span className="text-xs text-green-600 font-semibold">
                    Default Address
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs text-blue-600 underline"
                  >
                    Set as default
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(addr)}
                  className="text-sm text-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressSection;
