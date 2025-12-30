const Footer = () => {
  return (
    <footer className="mt-10">
      <div className="max-w-[1000px] mx-auto px-5">
        {/* ================= TOP SECTION ================= */}
        <div className="flex gap-[70px] max-md:flex-col">
          {/* -------- Useful Links -------- */}
          <div>
            <h4 className="mb-5 text-sm font-semibold text-gray-800">
              Useful Links
            </h4>

            <ul className="grid grid-cols-3 grid-rows-6 gap-x-10 gap-y-2 list-none max-[500px]:gap-x-5">
              {[
                "Blog",
                "Privacy",
                "Terms",
                "FAQs",
                "Security",
                "Contact",
                "Partner",
                "Franchise",
                "Seller",
                "Warehouse",
                "Deliver",
                "Resources",
                "Recipes",
                "Bistro",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[12px] text-[#878787] hover:text-gray-700"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* -------- Categories -------- */}
          <div className="flex-1">
            <h4 className="mb-7 text-sm font-semibold text-gray-800 flex items-center gap-2">
              Categories
              <a href="#" className="text-sm font-normal text-[#6eab5c]">
                see all
              </a>
            </h4>

            <ul className="grid grid-cols-3 grid-rows-10 gap-x-10 gap-y-1 list-none max-[500px]:grid-cols-2">
              {[
                "Vegetables & Fruits",
                "Cold Drinks & Juices",
                "Bakery & Biscuits",
                "Dry Fruits, Masala & Oil",
                "Paan Corner",
                "Pharma & Wellness",
                "Ice Creams & Frozen Desserts",
                "Beauty & Cosmetics",
                "Stationary Needs",
                "Print Store",
                "Dairy & Breakfast",
                "Instant & Frozen Food",
                "Sweet Tooth",
                "Sauces & Spreads",
                "Organic & Premium",
                "Cleaning Essentials",
                "Personal Care",
                "Fashion & Accessories",
                "Books",
                "E-Gift Cards",
                "Munchies",
                "Tea, Coffee & Health Drinks",
                "Atta, Rice & Dal",
                "Chicken, Meat & Fish",
                "Baby Care",
                "Home & Office",
                "Pet Care",
                "Electronics & Electricals",
                "Toys & Games",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block text-[12px] text-[#878787] truncate hover:text-gray-700"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ================= COPYRIGHT BAR ================= */}
        <div className="bg-[#fcfcfc] flex items-center justify-between px-5 py-4 rounded-md my-5 max-sm:flex-col max-sm:gap-3">
          <p className="text-[12px] text-[#878787]">
            © Blink Commerce Private Limited, 2016-2025
          </p>

          <div className="flex gap-2">
            {[
              "ri-facebook-fill",
              "ri-twitter-fill",
              "ri-instagram-line",
              "ri-linkedin-fill",
              "ri-threads-fill",
            ].map((icon) => (
              <a
                key={icon}
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f]"
              >
                <i className={`${icon} text-white text-[18px]`} />
              </a>
            ))}
          </div>
        </div>

        {/* ================= DISCLAIMER ================= */}
        <p className="text-[12px] text-[#878787] leading-snug">
          “Blinkit” is owned & managed by "Blink Commerce Private Limited" and
          is not related, linked or interconnected in whatsoever manner or
          nature, to “GROFFR.COM” which is a real estate services business
          operated by “Redstone Consultancy Services Private Limited”.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
