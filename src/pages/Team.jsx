import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { client } from "../../sanity";
import { Container } from '../components/Container';
import { FadeIn, FadeInStagger } from '../components/FadeIn';
import { FaInstagram, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

const urlFor = (source) => {
  if (!source || !source.asset) return null;
  return builder.image(source).width(400).height(400).auto('format').fit('max').url();
};

const socialMediaIcons = {
  instagram: <FaInstagram />,
  twitter: <FaTwitter />,
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
};

const Team = () => {
  const [teamData, setTeamData] = useState([]);
  const [year, setYear] = useState("2025");
  const [selectedTab, setSelectedTab] = useState("Advisory");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      const query = `*[_type == "team" && year == $year] {
        name, photo { asset -> { url } }, committee, position, socialMedia[] { platform, url }, society
      } | order(society, committee)`;

      try {
        const data = await client.fetch(query, { year });
        setTeamData(data);
      } catch (error) {
        setError('Failed to load team data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [year, selectedTab]);

  // Preload images
  useEffect(() => {
    const selectedImages = teamData
      .filter((member) => member.committee === selectedTab || selectedTab === "All" || selectedTab === "Advisory")
      .map((member) => (member.photo ? urlFor(member.photo) : null))
      .filter(Boolean);

    setImageUrls(selectedImages);
    setImagesLoaded(0);
  }, [teamData, selectedTab]);

  useEffect(() => {
    if (imageUrls.length > 0) {
      preloadImages(imageUrls);
    }
  }, [imageUrls]);

  const preloadImages = (urls) => {
    let loadedCount = 0;

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          setImagesLoaded(loadedCount);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === urls.length) {
          setImagesLoaded(loadedCount);
        }
      };
    });
  };

  const groupedData = teamData.reduce((acc, member) => {
    if (!member.committee) return acc;

    if (member.committee === "Advisory" || member.committee === "Faculty") {
      acc["Advisory"] = acc["Advisory"] || { Faculty: [], Advisory: [] };
      acc["Advisory"][member.committee].push(member);
    } else {
      if (!member.society) return acc;

      acc[member.society] = acc[member.society] || { EC: [], CC: [] };
      acc[member.society][member.committee] = acc[member.society][member.committee] || [];
      acc[member.society][member.committee].push(member);
    }

    return acc;
  }, {});

  const sortFacultyMembers = (members) => {
    return members.sort((a, b) => {
      // Put Branch Counselor first
      if (a.position.toLowerCase().includes('branch counselor')) return -1;
      if (b.position.toLowerCase().includes('branch counselor')) return 1;
      return 0;
    });
  };

  const sortECMembers = (members) => {
    return members.sort((a, b) => {
      const aPosition = a.position.toLowerCase();
      const bPosition = b.position.toLowerCase();

      const getPositionRank = (position) => {
        if (position.includes('chairperson') && !position.includes('vice')) return 1;
        if (position.includes('vice')) return 2;
        return 3;
      };

      return getPositionRank(aPosition) - getPositionRank(bPosition);
    });
  };

  const sortCCMembers = (members) => {
    const teamOrder = [
      'technical', 'editorial', 'programs', 'coverage', 'promotions',
      'social media', 'graphic design', 'curations', 'corporate',
      'logistics', 'community'
    ];

    return members.sort((a, b) => {
      const aTeam = teamOrder.findIndex(team => a.position.toLowerCase().includes(team));
      const bTeam = teamOrder.findIndex(team => b.position.toLowerCase().includes(team));

      if (aTeam !== bTeam) return aTeam - bTeam;

      const aIsHead = a.position.toLowerCase().includes('head') && !a.position.toLowerCase().includes('senior');
      const bIsHead = b.position.toLowerCase().includes('head') && !b.position.toLowerCase().includes('joint');

      if (aIsHead && !bIsHead) return -1;
      if (!aIsHead && bIsHead) return 1;

      return 0;
    });
  };

  const renderImage = (photo, person) => {
    const imageUrl = photo ? urlFor(photo) : null;

    return (
      <div className="relative h-80 w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${person.name} - ${person.position}`}
            className="rounded-t-xl object-cover w-full h-full"
            loading="lazy"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
        ) : (
          <div className="h-80 w-full bg-gray-300 dark:bg-gray-600 flex justify-center items-center">
            <span className="text-gray-500 dark:text-gray-200 text-lg">No Image</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-xl">
          <p className="text-lg font-semibold text-white">{person.name}</p>
          <p className="text-sm text-gray-300">{person.position}</p>
          <div className="flex space-x-3 mt-2">{renderSocialLinks(person.socialMedia)}</div>
        </div>
      </div>
    );
  };

  const renderSocialLinks = (socialMedia) => (
    socialMedia?.map((social, index) => {
      const Icon = socialMediaIcons[social.platform.trim().toLowerCase()];
      return Icon ? (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl text-ieee-blue hover:text-gray-400 dark:hover:text-gray-200 transition-all duration-300"
          aria-label={`${social.platform} profile`}
        >
          {Icon}
        </a>
      ) : null;
    })
  );

  // Scroll to selected tab
  const scrollToSection = (tab) => {
    const section = document.getElementById(tab);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Container className="mt-16 sm:mt-24 lg:mt-32 relative mb-12">
      <div className="text-center mt-8 mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-ieee-blue dark:text-ieee-light">Meet Our Team</h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
          Discover the talented individuals behind the development of our website.
        </p>
        <a
          href="/website-team"
          className="mt-4 inline-block text-base sm:text-lg font-semibold text-ieee-blue hover:text-ieee-dark dark:text-ieee-light dark:hover:text-ieee-dark transition-all duration-300"
        >
          Click here to meet the team who made this website
        </a>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          <span className="text-lg sm:text-xl font-semibold text-ieee-blue dark:text-ieee-light">Year:</span>
          <motion.div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className="font-medium text-sm">{year}</span>
              <FiChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {dropdownOpen && (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bg-white dark:bg-gray-800 shadow-xl rounded-md w-32 mt-2 z-10"
                role="menu"
              >
                {["2022", "2023", "2024", "2025"].map((yr) => (
                  <motion.li
                    key={yr}
                    onClick={() => {
                      setYear(yr);
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    role="menuitem"
                  >
                    {yr}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Advisory", "IEEE SB", "IEEE CS", "IEEE WIE", "IEEE CIS"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                scrollToSection(tab);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                selectedTab === tab
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              } transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              aria-current={selectedTab === tab ? 'page' : undefined}
            >
              {tab}
            </motion.button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading || imagesLoaded < imageUrls.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300">
              Loading...
            </div>
          ))}
        </div>
      ) : (
        selectedTab === "Advisory" && groupedData["Advisory"] ? (
          <div className="mb-12" id="Advisory">
            <h3 className="text-2xl font-semibold text-ieee-blue dark:text-ieee-light mb-4">Faculty</h3>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
            <FadeInStagger>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortFacultyMembers(groupedData["Advisory"].Faculty).map((person) => (
                  <FadeIn key={`${person.name}-${person.position}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                      {renderImage(person.photo, person)}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeInStagger>

            <h3 className="text-2xl font-semibold text-ieee-blue dark:text-ieee-light mb-4 mt-8">Advisory</h3>
            <hr className="my-4 border-gray-300 dark:border-gray-700" />
            <FadeInStagger>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupedData["Advisory"].Advisory.map((person) => (
                  <FadeIn key={`${person.name}-${person.position}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                      {renderImage(person.photo, person)}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeInStagger>
          </div>
        ) : (
          Object.entries(groupedData[selectedTab] || {}).map(([committee, members]) => (
            Array.isArray(members) ? (
              <div key={committee} className="mb-12" id={committee}>
                <h3 className="text-2xl font-semibold text-ieee-blue dark:text-ieee-light mb-4">
                  {committee.replace("EC", "Executive Committee").replace("CC", "Core Committee")}
                </h3>
                <hr className="my-4 border-gray-300 dark:border-gray-700" />
                <FadeInStagger>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {(committee === "EC" ? sortECMembers(members) : sortCCMembers(members)).map((person) => (
                      <FadeIn key={`${person.name}-${person.position}`}>
                        <div className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
                          {renderImage(person.photo, person)}
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </FadeInStagger>
              </div>
            ) : (
              <div key={committee} className="mb-12 text-red-500">Error: No members found for this committee.</div>
            )
          ))
        )
      )}
    </Container>
  );
};

export default Team;
