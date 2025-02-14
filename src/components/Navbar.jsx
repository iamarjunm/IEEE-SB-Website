import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

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
          { name: "Team", path: "/team" },
          { name: "Societies", path: "/societies" },
          { name: "Annual Report", path: "/annual-report" },
        ],
      },
      {
        name: "Explore",
        submenu: [
          { name: "Events", path: "/events" },
          { name: "Gallery", path: "/gallery" },
          { name: "Blog", path: "https://medium.com/@ieeemuj" },
        ],
      },
      { name: "Contact", path: "/contact" },
    ],
    []
  );

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 backdrop-blur-lg transition-all duration-500 ${
        scrolling
          ? "bg-white/80 dark:bg-[#0A1931]/80 h-14 shadow-md"
          : "bg-white/90 dark:bg-[#0A1931]/90 h-20"
      } border-b border-gray-300 dark:border-[#1E3A8A]`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-extrabold tracking-wide text-ieee-blue dark:text-ieee-light"
          >
            IEEE SB MUJ
          </motion.div>
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
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  className="flex items-center gap-1 cursor-pointer text-lg font-semibold"
                >
                  <span className="text-gray-700 hover:text-ieee-blue dark:text-gray-300 dark:hover:text-[#60A5FA]">
                    {item.name}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
                <AnimatePresence>
                  {activeDropdown === index && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute left-0 mt-2 w-40 bg-white dark:bg-[#0A1931] shadow-lg border border-gray-300 dark:border-[#1E3A8A] rounded-md overflow-hidden"
                    >
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className="block px-4 py-2 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#1E3A8A] transition"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 1 }}
                key={item.name}
              >
                <Link
                  to={item.path}
                  className="text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-ieee-blue dark:hover:text-[#60A5FA] transition"
                >
                  {item.name}
                </Link>
              </motion.div>
            )
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#1E3A8A] transition"
          >
            {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#0A1931]" />}
          </motion.button>

          {/* Exploding Join Now Button */}
          <motion.a
            href="https://www.ieee.org/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1}}
            whileTap={{ scale: 0.8, rotate: 5 }}
            className="hidden md:block px-5 py-2 rounded-lg text-lg font-semibold shadow-md transition-all bg-ieee-blue text-white hover:bg-blue-700 hover:shadow-xl"
          >
            JOIN NOW
          </motion.a>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-[#0A1931] shadow-lg p-5 backdrop-blur-md"
          >
            <button className="absolute top-4 right-4" onClick={() => setIsOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col gap-4 mt-10">
              {menuItems.map((item) =>
                item.submenu ? (
                  <details key={item.name} className="group">
                    <summary className="flex justify-between cursor-pointer text-lg font-semibold">{item.name}</summary>
                    <div className="ml-4 mt-2 flex flex-col">
                      {item.submenu.map((sub) => (
                        <Link key={sub.name} to={sub.path} className="py-1">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link key={item.name} to={item.path} className="text-lg font-semibold">
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
