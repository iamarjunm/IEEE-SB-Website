import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { client } from "../../sanity";
import { Container } from '../components/Container';
import { FadeIn, FadeInStagger } from '../components/FadeIn';
import { FaLinkedin, FaGraduationCap, FaEnvelope, FaMapMarkerAlt, FaUser, FaExternalLinkAlt } from 'react-icons/fa';
import { SiGooglescholar } from 'react-icons/si';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);

const urlFor = (source) => {
  if (!source || !source.asset) return null;
  return builder.image(source).width(400).height(400).auto('format').fit('max').url();
};

const Faculty = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [departments, setDepartments] = useState([]);

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoading(true);
      const query = `*[_type == "faculty"] {
        name,
        email,
        department,
        designation,
        educationalQualifications,
        linkedinUrl,
        googleScholarUrl,
        notableWorks,
        photo
      } | order(department, designation)`;

      try {
        const data = await client.fetch(query);
        setFacultyData(data);
        
        // Extract unique departments
        const uniqueDepartments = [...new Set(data.map(faculty => faculty.department))];
        setDepartments(["All", ...uniqueDepartments]);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setError('Failed to load faculty data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  const filteredFaculty = selectedDepartment === "All" 
    ? facultyData 
    : facultyData.filter(faculty => faculty.department === selectedDepartment);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-ieee-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ieee-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading faculty information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-ieee-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-ieee-blue text-white rounded-lg hover:bg-ieee-blue-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-ieee-dark transition-colors duration-300">
      <Container>
        <div className="py-20">
          {/* Header Section */}
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our <span className="text-ieee-blue">Faculty</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Meet the dedicated faculty members who guide and support IEEE Student Branch MUJ 
                in our journey of innovation and excellence.
              </p>
            </div>
          </FadeIn>

          {/* Department Filter */}
          <FadeIn>
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                      selectedDepartment === dept
                        ? 'bg-ieee-blue text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
              
              {/* Results count */}
              <div className="text-center mt-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''} 
                  {selectedDepartment !== "All" && ` in ${selectedDepartment}`}
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Faculty Grid */}
          <FadeInStagger>
            {filteredFaculty.length === 0 ? (
              <FadeIn>
                <div className="text-center py-20">
                  <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    No faculty members found for the selected department.
                  </p>
                </div>
              </FadeIn>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {filteredFaculty.map((faculty, index) => (
                  <FadeIn key={faculty._id || index}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    >
                      {/* Faculty Photo */}
                      <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
                        {faculty.photo ? (
                          <img
                            src={urlFor(faculty.photo)}
                            alt={faculty.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-ieee-blue to-ieee-blue-dark flex items-center justify-center">
                            <FaUser className="text-4xl sm:text-6xl text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        
                        {/* Name overlay for mobile */}
                        <div className="absolute bottom-4 left-4 right-4 sm:hidden">
                          <h3 className="text-lg font-bold text-white">
                            {faculty.name}
                          </h3>
                          <p className="text-sm text-gray-200">
                            {faculty.designation}
                          </p>
                        </div>
                        
                        {/* Social Links Overlay */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {faculty.linkedinUrl && (
                            <a
                              href={faculty.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-blue-600 transition-colors"
                              title="LinkedIn Profile"
                            >
                              <FaLinkedin className="text-sm sm:text-lg" />
                            </a>
                          )}
                          {faculty.googleScholarUrl && (
                            <a
                              href={faculty.googleScholarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-blue-600 transition-colors"
                              title="Google Scholar Profile"
                            >
                              <SiGooglescholar className="text-sm sm:text-lg" />
                            </a>
                          )}
                          {faculty.email && (
                            <a
                              href={`mailto:${faculty.email}`}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                              title="Send Email"
                            >
                              <FaEnvelope className="text-sm sm:text-lg" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Faculty Information */}
                      <div className="p-4 sm:p-6">
                        {/* Desktop name (hidden on mobile) */}
                        <div className="hidden sm:block">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {faculty.name}
                          </h3>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p className="text-ieee-blue font-semibold text-sm sm:text-base">
                            {faculty.designation}
                          </p>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FaMapMarkerAlt className="text-xs sm:text-sm mr-2 flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{faculty.department}</span>
                          </div>
                          
                          <div className="flex items-start text-gray-600 dark:text-gray-400">
                            <FaGraduationCap className="text-xs sm:text-sm mr-2 mt-1 flex-shrink-0" />
                            <span className="text-xs sm:text-sm line-clamp-2">{faculty.educationalQualifications}</span>
                          </div>
                        </div>

                        {/* Notable Works */}
                        {faculty.notableWorks && (
                          <div className="mb-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              Notable Work:
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                              {faculty.notableWorks}
                            </p>
                          </div>
                        )}

                        {/* Contact Information */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              Contact
                            </span>
                            <div className="flex gap-2">
                              {faculty.linkedinUrl && (
                                <a
                                  href={faculty.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="LinkedIn Profile"
                                >
                                  <FaLinkedin className="text-sm sm:text-lg" />
                                </a>
                              )}
                              {faculty.googleScholarUrl && (
                                <a
                                  href={faculty.googleScholarUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Google Scholar Profile"
                                >
                                  <SiGooglescholar className="text-sm sm:text-lg" />
                                </a>
                              )}
                              {faculty.email && (
                                <a
                                  href={`mailto:${faculty.email}`}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Send Email"
                                >
                                  <FaEnvelope className="text-sm sm:text-lg" />
                                </a>
                              )}
                              {(faculty.linkedinUrl || faculty.googleScholarUrl) && (
                                <FaExternalLinkAlt className="text-xs text-gray-300 ml-1 mt-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            )}
          </FadeInStagger>
        </div>
      </Container>
    </div>
  );
};

export default Faculty;
