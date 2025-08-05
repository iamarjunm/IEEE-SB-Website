import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import {
  Users,
  Landmark,
  FileText,
  Trophy,
  CalendarDays,
  Image,
  BookOpen,
  Mail,
  UserCheck,
} from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState("");

  const handleSubMenuToggle = (name) => {
    setOpenSubMenu((prev) => (prev === name ? "" : name));
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = useMemo(
    () => [
      { name: "Home", path: "/" },
      {
        name: "About Us",
        submenu: [
          {
            name: "Team",
            path: "/team",
            icon: <Users />,
            description: "Meet our dedicated team of innovators and leaders.",
          },
          {
            name: "Faculty",
            path: "/faculty",
            icon: <UserCheck />,
            description: "Meet the distinguished faculty supporting our journey.",
          },
          {
            name: "Societies",
            path: "/societies",
            icon: <Landmark />,
            description: "Explore our vibrant IEEE communities and initiatives.",
          },
          {
            name: "Annual Report",
            path: "/annual-report",
            icon: <FileText />,
            description: "Dive into our achievements, milestones, and growth.",
          },
          {
            name: "Achievements",
            path: "/achievements",
            icon: <Trophy />,
            description: "Discover the milestones we've conquered together.",
          },
        ],
      },
      {
        name: "Explore",
        submenu: [
          {
            name: "Events",
            path: "/events",
            icon: <CalendarDays />,
            description: "Stay updated with our latest thrilling events.",
          },
          {
            name: "Gallery",
            path: "/gallery",
            icon: <Image />,
            description: "Relive unforgettable moments through our gallery.",
          },
          {
            name: "Blog",
            path: "https://medium.com/@ieeemuj",
            icon: <BookOpen />,
            description: "Gain insights from our tech-driven blog posts.",
          },
        ],
      },
      { name: "Contact", path: "/contact", icon: <Mail /> },
    ],
    []
  );

  const renderSubmenu = (submenu) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="absolute left-0 mt-2 w-[600px] bg-white dark:bg-[#0A1931] shadow-lg border border-gray-300 dark:border-[#1E3A8A] rounded-md overflow-hidden grid grid-cols-2 gap-4 p-6"
    >
      {submenu.map((sub, index) => (
        <Link
          key={sub.name}
          to={sub.path}
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E3A8A] transition ${
            index % 2 === 0 ? "col-span-1" : "col-span-1"
          }`}
        >
          <div className="flex items-center justify-center rounded-lg bg-blue-100 p-2 dark:bg-[#1E3A8A]">
            {sub.icon}
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-300">
              {sub.name}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sub.description}
            </p>
          </div>
        </Link>
      ))}
    </motion.div>
  );

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 backdrop-blur-lg transition-all duration-500 ${
        scrolling
          ? "bg-white/80 dark:bg-[#0A1931]/80 h-14 shadow-md"
          : "bg-white/90 dark:bg-[#0A1931]/90 h-20"
      } border-b border-gray-300 dark:border-[#1E3A8A]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-full">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://cdn.sanity.io/images/gcb0j4e6/production/bce1d61c26cf99fb80ef126cda5fbc34e0c39780-287x84.png"
            alt="IEEE SB MUJ Logo"
            className="h-8 sm:h-10 object-contain dark:hidden"
          />
          <img
            src="https://cdn.sanity.io/images/gcb0j4e6/production/e1a5d687d5c7eb204054dd282a8c57d1ee7f4c61-287x84.png"
            alt="IEEE SB MUJ Dark Logo"
            className="h-8 sm:h-10 object-contain hidden dark:block"
          />
        </Link>

        {/* NAV LINKS (Desktop) */}
        <div className="hidden md:flex space-x-6">
          {menuItems.map((item, index) =>
            item.submenu ? (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 cursor-pointer text-lg font-semibold"
                >
                  <span className="text-gray-700 hover:text-ieee-blue dark:text-gray-300 dark:hover:text-[#60A5FA]">
                    {item.name}
                  </span>
                </motion.div>
                <AnimatePresence>
                  {activeDropdown === index && renderSubmenu(item.submenu)}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className="text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-[#60A5FA] transition"
              >
                {item.name}
              </Link>
            )
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setIsDark(!isDark)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#1E3A8A] transition"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-[#0A1931]" />
            )}
          </motion.button>

          {/* JOIN NOW Button */}
          <motion.a
            href="https://www.ieee.org/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-5 py-2 rounded-lg text-lg font-semibold shadow-md bg-ieee-blue text-white hover:bg-blue-700 hover:shadow-lg transition"
          >
            JOIN NOW
          </motion.a>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-white to-gray-200 dark:from-[#0A1931] dark:to-[#1E3A8A] h-screen shadow-2xl flex flex-col p-8"
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 p-3 rounded-full bg-ieee-blue hover:bg-[#60A5FA] dark:bg-[#1E3A8A] dark:hover:bg-[#3B82F6] transition-all shadow-xl ring-2 ring-white dark:ring-[#0A1931] scale-110"
        onClick={() => setIsOpen(false)}
        aria-label="Close Menu"
      >
        <X className="w-6 h-6 text-white" />
      </button>

{/* Menu Items */}
<div className="flex flex-col gap-10 mt-24">
  {menuItems.map((item) => (
    <div key={item.name} className="group">
      {item.submenu ? (
        <div>
          <button
            className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-wider 
            hover:text-ieee-blue dark:hover:text-[#60A5FA] transition-all duration-300 w-full text-left"
            onClick={() => handleSubMenuToggle(item.name)}
          >
            {item.name}
          </button>

          {/* Dropdown Content */}
          {openSubMenu === item.name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 mt-3 flex flex-col gap-3"
            >
              {item.submenu.map((sub) => (
                <Link
                  key={sub.name}
                  to={sub.path}
                  className="text-lg text-gray-700 dark:text-gray-300 hover:text-ieee-blue 
                  dark:hover:text-[#60A5FA] transition-all duration-200 pl-2 
                  border-l-4 border-transparent hover:border-ieee-blue dark:hover:border-[#60A5FA]"
                  onClick={() => {
                    setIsOpen(false); // Auto-close navbar on click
                    handleSubMenuToggle(""); // Close submenu
                  }}
                >
                  {sub.name}
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <Link
          to={item.path}
          className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-wider 
          hover:text-ieee-blue dark:hover:text-[#60A5FA] transition-all duration-300"
          onClick={() => setIsOpen(false)} // Auto-close navbar on click
        >
          {item.name}
        </Link>
      )}
    </div>
  ))}
</div>

{/* Footer Links */}
<div className="absolute bottom-8 w-full text-center">
  <p className="text-base text-gray-500 dark:text-gray-400">
    Powered by <span className="font-semibold text-ieee-blue">IEEE SB MUJ</span>
  </p>
</div>

    </motion.div>
  )}
</AnimatePresence>

    </nav>
  );
}