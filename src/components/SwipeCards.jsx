import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { client } from "../../sanity";
import imageUrlBuilder from "@sanity/image-url";
import { FiChevronDown } from "react-icons/fi";
import { FaCalendarAlt, FaUsers, FaTrophy } from "react-icons/fa";
import CountUp from "react-countup";
import { Fade } from "react-awesome-reveal";

const builder = imageUrlBuilder(client);
function urlFor(source) {
  return builder.image(source);
}

const SwipeCards = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [events, setEvents] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSociety, setSelectedSociety] = useState("");
  const dropdownRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.fetch(
        `*[_type == "event"]{
          _id, name, startDateTime, 
          "imageUrl": poster.asset->url, 
          formLink, society, teamSize, prizePool
        }`
      );
      setEvents(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(
        (event) => new Date(event.startDateTime).getFullYear() === selectedYear
      )
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  }, [events, selectedYear]);

  const societiesWithEvents = useMemo(() => {
    const societies = ["ieeexacm", "genesis", "ieee-sb", "ieee-cs", "ieee-wie"];
    return societies.filter((society) =>
      filteredEvents.some((event) => event.society === society)
    );
  }, [filteredEvents]);

  useEffect(() => {
    if (!societiesWithEvents.includes(selectedSociety)) {
      setSelectedSociety(societiesWithEvents[0] || "");
    }
  }, [societiesWithEvents, selectedSociety]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 dark:from-ieee-dark dark:to-gray-900 p-4 scroll-smooth">
      {/* Year Selector */}
      <div className="sticky top-0 bg-white dark:bg-ieee-dark z-20 py-4 mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold text-ieee-blue dark:text-ieee-light">
            Year:
          </span>
          <motion.div className="relative dropdown-menu" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200/60 dark:bg-gray-700/80 backdrop-blur-lg text-gray-800 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-colors"
              aria-label="Select Year"
            >
              <span className="font-medium text-sm">{selectedYear}</span>
              <FiChevronDown
                className={`transition-transform ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl rounded-md w-32 mt-2 z-10"
                >
                  {[2022, 2023, 2024, 2025].map((year) => (
                    <motion.li
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
                    >
                      {year}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      {hasEvents && societiesWithEvents.length > 0 && (
        <Fade cascade damping={0.1} key={selectedYear}>
          <div className="flex flex-wrap justify-center space-x-2 mb-6">
            {societiesWithEvents.map((society) => (
              <button
                key={society}
                onClick={() => setSelectedSociety(society)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  selectedSociety === society
                    ? "bg-ieee-blue text-white dark:bg-ieee-light dark:text-gray-900"
                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {society.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </Fade>
      )}

      <Fade key={selectedSociety || selectedYear}>
        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ieee-blue"></div>
          </div>
        )}
        {/* No Events Message */}
        {!loading && !hasEvents && (
          <p className="text-center text-gray-500 mt-4 text-lg">
            No events found for {selectedYear}
          </p>
        )}
        {/* Events Grid */}
        {!loading && selectedSociety && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents
              .filter((event) => event.society === selectedSociety)
              .map((event) => (
                <EventCard event={event} key={event._id} />
              ))}
          </div>
        )}
      </Fade>
    </div>
  );
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const eventDate = new Date(event.startDateTime);
  const today = new Date();

  const handleClick = () => {
    const route =
      eventDate < today
        ? `/events/post/${event._id}`
        : `/events/pre/${event._id}`;
    navigate(route);
  };

  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const optimizedImageUrl = urlFor(event.imageUrl)
    .width(window.innerWidth < 640 ? 280 : 440)
    .height(window.innerWidth < 640 ? 380 : 420)
    .auto("format")
    .url();

  return (
    <motion.div
      onClick={handleClick}
      className="group relative h-[280px] w-full sm:h-[420px] overflow-hidden rounded-2xl shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105 will-change-transform"
      whileHover={{ scale: 1.05 }}
      aria-label={`Event: ${event.name}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${optimizedImageUrl || "/fallback.jpg"})`,
        }}
      ></div>

      <motion.div className="absolute inset-0 z-10 flex flex-col justify-end p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-xl sm:text-3xl font-bold uppercase text-white tracking-wide mb-2 drop-shadow-xl">
          {event.name}
        </h3>
        <div className="flex items-center space-x-2 sm:space-x-4 text-gray-200">
          <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
          <p className="text-sm sm:text-base">{formattedDate}</p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 text-gray-200 mt-2">
          <FaUsers className="w-4 h-4 sm:w-5 sm:h-5" />
          <p className="text-sm sm:text-base">
            Team Size: <CountUp end={event.teamSize} duration={2} />
          </p>
        </div>
        {event.prizePool > 0 && (
          <div className="flex items-center space-x-2 sm:space-x-4 text-gray-200 mt-2">
            <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-sm sm:text-base">
              Prize Pool:{" "}
              <CountUp end={event.prizePool} duration={2} prefix="₹" />
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SwipeCards;
