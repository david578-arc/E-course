// CourseEnrollment.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Enrollment.css';

const CourseEnrollment = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All Courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userId, setUserId] = useState(1); // Normally from auth
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data);
        setFilteredCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let results = courses;

    if (searchTerm) {
      results = results.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter !== 'All Courses') {
      if (filter === 'Free Courses') {
        results = results.filter(course => course.price === 0);
      } else if (filter === 'Paid Courses') {
        results = results.filter(course => course.price > 0);
      }
    }

    setFilteredCourses(results);
  }, [searchTerm, filter, courses]);

  const handleEnrollNow = (course) => {
    setSelectedCourse(course);
    if (course.price === 0) {
      handleFreeEnrollment(course);
    } else {
      navigate('/choose-payment', { state: { course, userId } });
    }
  };

  const handleFreeEnrollment = async (course) => {
    try {
      const response = await axios.post(`/enrollments/${userId}/${course.id}`);
      alert(response.data || `Successfully enrolled in ${course.title}!`);
    } catch (err) {
      alert(`Error enrolling: ${err.response?.data || err.message}`);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `₹${price.toFixed(2)}`;
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-enrollment">
      <h1>Course Enrollment</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All Courses">All Courses</option>
          <option value="Free Courses">Free Courses</option>
          <option value="Paid Courses">Paid Courses</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="no-courses">No courses found matching your criteria.</div>
      ) : (
        <div className="course-list">
          {filteredCourses.map(course => (
            <div className="course-card" key={course.id}>
              <img 
                src={course.imageUrl || `/api/placeholder/150/100`} 
                alt={course.title} 
                className="course-image" 
              />
              <div className="course-details">
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p className="instructor">Instructor: {course.instructor}</p>
                <p className="price">{formatPrice(course.price)}</p>
                <button 
                  className="enroll-btn"
                  onClick={() => handleEnrollNow(course)}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseEnrollment;
