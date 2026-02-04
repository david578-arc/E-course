import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaSignInAlt, 
  FaComments, 
  FaQuestion, 
  FaSearch, 
  FaBell, 
  FaUserCircle, 
  FaGraduationCap,
  FaChartLine,
  FaCertificate,
  FaHome,
  FaSignOutAlt,
  FaBookmark,
  FaFilter,
  FaStar,
  FaClock
} from "react-icons/fa";
import "./HomePage.css";

const Homepage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [popularCourses, setPopularCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  
  const username = localStorage.getItem("username") || "User";
  const profileImage = localStorage.getItem("profileImage");
  
  // Fetch courses data
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/api/courses")
      .then((res) => res.json())
      .then((data) => {
        const validCourses = data.filter(course => course.title !== "string");
        setCourses(validCourses);
        setFilteredCourses(validCourses);
        
        // Extract categories
        const uniqueCategories = [...new Set(validCourses.map(course => course.category || "Uncategorized"))];
        setCategories(["All", ...uniqueCategories]);
        
        // Set popular courses (example logic - could be based on ratings)
        setPopularCourses(validCourses.slice(0, 3));
        
        // Set recent courses (example logic - could be based on date)
        setRecentCourses(validCourses.slice(0, 2));
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

  // Filter courses based on search and category
  useEffect(() => {
    let results = courses;
    
    if (searchTerm) {
      results = results.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "All") {
      results = results.filter(course => course.category === selectedCategory);
    }
    
    setFilteredCourses(results);
  }, [searchTerm, selectedCategory, courses]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Example recommended courses based on user interests (would be from backend in real app)
  const recommendedCourses = courses.slice(0, 3);

  // Mock user progress data
  const userProgress = {
    completed: 60,
    coursesCompleted: 6,
    coursesInProgress: 2,
    totalHoursLearned: 48
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="brand">Dorcas</h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ≡
          </button>
        </div>
        
        <div className="user-profile-sidebar">
          <img src={profileImage || "/default-profile.png"} alt="Profile" />
          <span>{username}</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
            <FaHome className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <FaUserCircle className="nav-icon" />
            <span className="nav-text">Profile</span>
          </Link>
          <Link to="/notification" className="nav-item">
            <FaBell className="nav-icon" />
            <span className="nav-text">Notifications</span>
          </Link>
          <Link to="/analytics" className="nav-item">
            <FaChartLine className="nav-icon" />
            <span className="nav-text">Analytics</span>
          </Link>
          <Link to="/certificate" className="nav-item">
            <FaCertificate className="nav-icon" />
            <span className="nav-text">Certificates</span>
          </Link>
          <Link to="/saved-courses" className="nav-item">
            <FaBookmark className="nav-icon" />
            <span className="nav-text">Saved Courses</span>
          </Link>
          <button className="logout nav-item" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">Dashboard</h1>
          </div>
          
          <div className="topbar-right">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search courses, topics, instructors..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="notification-bell">
              <FaBell />
              <span className="notification-badge">3</span>
            </div>
            
            <Link to="/profile" className="profile-link">
              <img
                src={profileImage || "/default-profile.png"}
                alt="Profile"
                className="profile-avatar"
              />
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h2>Welcome back, {username}! 👋</h2>
            <p>Pick up where you left off and continue your learning journey.</p>
          </div>
          <div className="welcome-stats">
            <div className="stat-card">
              <h3>{userProgress.coursesCompleted}</h3>
              <p>Courses Completed</p>
            </div>
            <div className="stat-card">
              <h3>{userProgress.coursesInProgress}</h3>
              <p>In Progress</p>
            </div>
            <div className="stat-card">
              <h3>{userProgress.totalHoursLearned}h</h3>
              <p>Total Hours</p>
            </div>
          </div>
        </section>

        {/* Continue Learning Section */}
        <section className="continue-learning-section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <Link to="/my-courses" className="see-all-link">See All</Link>
          </div>
          
          <div className="course-progress-cards">
            {recentCourses.map(course => (
              <div key={`recent-${course.id}`} className="course-progress-card">
                <div className="course-image-container">
                  <img src={course.imageUrl || `/course-placeholder.jpg`} alt={course.title} />
                  <div className="progress-indicator">
                    <div className="progress-bar-fill" style={{width: `${Math.random() * 100}%`}}></div>
                  </div>
                </div>
                <div className="course-progress-info">
                  <h3>{course.title}</h3>
                  <p className="instructor">by {course.instructor}</p>
                  <div className="progress-details">
                    <span>{Math.floor(Math.random() * 8) + 1}/10 lessons</span>
                    <span>{Math.floor(Math.random() * 60) + 40}% complete</span>
                  </div>
                  <Link to={`/course/${course.id}`} className="continue-button">Continue</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Browse Section */}
        <section className="courses-browser-section">
          <div className="section-header">
            <h2>Browse Courses</h2>
            <div className="filter-controls">
              <div className="category-filter">
                <FaFilter className="filter-icon" />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="view-toggle">
                <button className="grid-view active">Grid</button>
                <button className="list-view">List</button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading courses...</div>
          ) : (
            <>
              {filteredCourses.length === 0 ? (
                <div className="no-courses-found">
                  <p>No courses found matching your criteria. Try adjusting your search.</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="course-card">
                      <div className="course-thumbnail">
                        <img src={course.imageUrl || `/course-placeholder-${course.id % 5}.jpg`} alt={course.title} />
                        <div className="course-level">{course.level || "Beginner"}</div>
                      </div>
                      <div className="course-info">
                        <div className="course-category">{course.category || "General"}</div>
                        <h3 className="course-title">{course.title}</h3>
                        <p className="course-description">{course.description}</p>
                        <div className="course-meta">
                          <span className="course-instructor">
                            <FaUserCircle />
                            {course.instructor}
                          </span>
                          <span className="course-rating">
                            <FaStar />
                            {course.rating || "4.8"}
                          </span>
                          <span className="course-duration">
                            <FaClock />
                            {course.duration || "6h"}
                          </span>
                        </div>
                      </div>
                      <div className="course-actions">
                        <Link to={`/enrollment/${course.id}`} className="action-button enroll" title="Enroll">
                          <FaSignInAlt />
                          <span>Enroll</span>
                        </Link>
                        <Link to={`/quiz/${course.id}`} className="action-button quiz" title="Take Quiz">
                          <FaQuestion />
                          <span>Quiz</span>
                        </Link>
                        <Link to={`/discussion/${course.id}`} className="action-button discuss" title="Discussion">
                          <FaComments />
                          <span>Discuss</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Recommended For You Section */}
        <section className="recommended-section">
          <div className="section-header">
            <h2>Recommended For You</h2>
            <Link to="/recommendations" className="see-all-link">See All</Link>
          </div>
          
          <div className="recommended-courses">
            {recommendedCourses.map(course => (
              <div key={`rec-${course.id}`} className="recommended-course-card">
                <img src={course.imageUrl || `/course-placeholder-${course.id % 3}.jpg`} alt={course.title} />
                <div className="overlay-content">
                  <h3>{course.title}</h3>
                  <p>{course.instructor}</p>
                  <div className="course-rating">
                    {Array(5).fill(0).map((_, i) => (
                      <FaStar key={i} className={i < 4 ? "star-filled" : ""} />
                    ))}
                    <span>4.0</span>
                  </div>
                  <Link to={`/course/${course.id}`} className="view-course-btn">View Course</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="learning-path-section">
          <div className="section-header">
            <h2>Your Learning Path</h2>
          </div>
          
          <div className="learning-path">
            <div className="path-step completed">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Getting Started</h4>
                <p>Introduction to the platform</p>
                <span className="status">Completed</span>
              </div>
            </div>
            <div className="path-step completed">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Build Foundations</h4>
                <p>Fundamentals and core concepts</p>
                <span className="status">Completed</span>
              </div>
            </div>
            <div className="path-step current">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Advanced Skills</h4>
                <p>Deepen your knowledge</p>
                <span className="status">In Progress</span>
              </div>
            </div>
            <div className="path-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Expert Level</h4>
                <p>Master specialized techniques</p>
                <span className="status">Upcoming</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>&copy; {new Date().getFullYear()} Dorcas Learning Platform. All rights reserved.</p>
          <div className="footer-links">
            <a href="/help">Help Center</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Homepage;