import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminCourse.css';

const Admincourse = () => {
  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({ 
    id: null, 
    title: '', 
    description: '', 
    instructor: '', 
    price: 0, 
    imageUrl: '',
    category: '',
    duration: '',
    level: 'BEGINNER',
    tags: '',
    maxStudents: 100,
    startDate: '',
    endDate: '',
    status: 'PENDING'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [notification, setNotification] = useState(null);

  // Constants
  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Photography'];
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter and sort courses whenever dependencies change
  useEffect(() => {
    filterAndSortCourses();
  }, [courses, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/course-management/courses');
      
      // Ensure we always have an array, even if the response is empty or malformed
      const coursesData = Array.isArray(response.data) ? response.data : [];
      
      setCourses(coursesData);
      showNotification('Courses loaded successfully', 'success');
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
      showNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCourses = () => {
    // Ensure courses is always treated as an array
    const coursesArray = Array.isArray(courses) ? courses : [];
    
    let filtered = coursesArray.filter(course => {
      // Safely access course properties with optional chaining
      const courseTitle = course?.title?.toLowerCase() || '';
      const courseInstructor = course?.instructor?.toLowerCase() || '';
      const courseDescription = course?.description?.toLowerCase() || '';
      const courseStatus = course?.status || '';
      const courseCategory = course?.category || '';
      
      const matchesSearch = courseTitle.includes(searchTerm.toLowerCase()) ||
                          courseInstructor.includes(searchTerm.toLowerCase()) ||
                          courseDescription.includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || courseStatus === statusFilter;
      const matchesCategory = categoryFilter === 'ALL' || courseCategory === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sorting with fallbacks for missing values
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // CRUD Operations
  const handleAdd = () => {
    setCurrentCourse({ 
      id: null, 
      title: '', 
      description: '', 
      instructor: '', 
      price: 0, 
      imageUrl: '',
      category: '',
      duration: '',
      level: 'BEGINNER',
      tags: '',
      maxStudents: 100,
      startDate: '',
      endDate: '',
      status: 'PENDING'
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setCurrentCourse({ 
      ...course, 
      tags: course.tags ? (Array.isArray(course.tags) ? course.tags.join(', ') : course.tags) : '' 
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCourseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    
    try {
      await axios.delete(`/api/admin/course-management/courses/${courseToDelete}`);
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseToDelete));
      showNotification('Course deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting course:', err);
      showNotification('Error deleting course', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    }
  };

  // Bulk operations
  const handleBulkAction = async (action) => {
    if (!selectedCourses.length) {
      showNotification('Please select at least one course', 'warning');
      return;
    }

    try {
      let updatedCourses = [...courses];
      
      if (action === 'delete') {
        await Promise.all(
          selectedCourses.map(id => 
            axios.delete(`/admin/course-management/courses/${id}`)
          )
        );
        updatedCourses = updatedCourses.filter(c => !selectedCourses.includes(c.id));
      } else {
        const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        
        await Promise.all(
          selectedCourses.map(id => 
            axios.patch(`/admin/course-management/courses/${id}/status`, { status: newStatus })
          )
        );
        
        updatedCourses = updatedCourses.map(c => 
          selectedCourses.includes(c.id) ? { ...c, status: newStatus } : c
        );
      }
      
      setCourses(updatedCourses);
      setSelectedCourses([]);
      showNotification(`Bulk ${action} completed successfully`, 'success');
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err);
      showNotification(`Error during bulk ${action}`, 'error');
    } finally {
      setShowBulkModal(false);
    }
  };

  // Status change handlers
  const handleApprove = async (id) => {
    try {
      await axios.patch(`/admin/course-management/courses/${id}/status`, { status: 'APPROVED' });
      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c));
      showNotification('Course approved successfully', 'success');
    } catch (err) {
      console.error('Error approving course:', err);
      showNotification('Error approving course', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`/admin/course-management/courses/${id}/status`, { status: 'REJECTED' });
      setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c));
      showNotification('Course rejected successfully', 'success');
    } catch (err) {
      console.error('Error rejecting course:', err);
      showNotification('Error rejecting course', 'error');
    }
  };

  // Form handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare course data
    const courseData = {
      ...currentCourse,
      tags: currentCourse.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      price: parseFloat(currentCourse.price) || 0,
      maxStudents: parseInt(currentCourse.maxStudents) || 100
    };

    try {
      let response;
      
      if (isEditing) {
        response = await axios.put(
          `/admin/course-management/courses/${currentCourse.id}`, 
          courseData
        );
        setCourses(prev => prev.map(c => 
          c.id === currentCourse.id ? response.data : c
        ));
        showNotification('Course updated successfully', 'success');
      } else {
        response = await axios.post(
          '/admin/course-management/courses', 
          courseData
        );
        setCourses(prev => [...prev, response.data]);
        showNotification('Course created successfully', 'success');
      }
      
      setShowModal(false);
    } catch (err) {
      console.error('Error saving course:', err);
      showNotification(
        err.response?.data?.message || 'Error saving course', 
        'error'
      );
    }
  };

  // Selection handling
  const handleSelectCourse = (id) => {
    setSelectedCourses(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = getCurrentPageCourses().map(c => c.id);
    if (selectedCourses.length === currentPageIds.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(currentPageIds);
    }
  };

  // Export functionality
  const exportCourses = () => {
    if (!filteredCourses.length) {
      showNotification('No courses to export', 'warning');
      return;
    }

    try {
      let dataStr, mimeType, fileExtension;
      
      if (exportFormat === 'json') {
        dataStr = JSON.stringify(filteredCourses, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else {
        // CSV export
        const headers = Object.keys(filteredCourses[0]).join(',');
        const rows = filteredCourses.map(course => 
          Object.values(course).map(value => 
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          ).join(',')
        );
        dataStr = [headers, ...rows].join('\n');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      }
      
      const blob = new Blob([dataStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `courses_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(`Exported ${filteredCourses.length} courses as ${exportFormat.toUpperCase()}`, 'success');
    } catch (err) {
      console.error('Error exporting courses:', err);
      showNotification('Error exporting courses', 'error');
    }
  };

  // Statistics calculation
  const getStats = () => {
    const total = courses.length;
    const approved = courses.filter(c => c.status === 'APPROVED').length;
    const pending = courses.filter(c => c.status === 'PENDING').length;
    const rejected = courses.filter(c => c.status === 'REJECTED').length;
    const totalPrice = courses.reduce((sum, c) => sum + (parseFloat(c.price) || 0), 0);
    const avgPrice = total ? totalPrice / total : 0;
    
    return { total, approved, pending, rejected, avgPrice };
  };

  // Pagination helpers
  const getCurrentPageCourses = () => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  };

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage) || 1;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchCourses} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const stats = getStats();
  const currentCourses = getCurrentPageCourses();

  return (
    <div className={`admin-course-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            onClick={() => setNotification(null)} 
            className="notification-close"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <header className="admin-header">
        <h1>Course Management</h1>
        <div className="header-controls">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="theme-toggle"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button 
            onClick={() => setShowStatsModal(true)} 
            className="stats-btn"
          >
            📊 Statistics
          </button>
        </div>
      </header>

      {/* Controls Section */}
      <section className="controls-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="search"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search courses"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-controls">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="instructor">Instructor</option>
              <option value="price">Price</option>
              <option value="status">Status</option>
              <option value="createdAt">Date Created</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="sort-order-btn"
              aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleAdd} className="btn btn-primary">
            ➕ Add Course
          </button>
          <button 
            onClick={() => setShowBulkModal(true)} 
            className="btn btn-secondary"
            disabled={!selectedCourses.length}
          >
            📦 Bulk Actions ({selectedCourses.length})
          </button>
          <div className="export-controls">
            <button 
              onClick={exportCourses} 
              className="btn btn-export"
              disabled={!filteredCourses.length}
            >
              📤 Export
            </button>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="export-format-select"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        {/* Courses Table */}
        <div className="table-responsive">
          <table className="courses-table">
            <thead>
              <tr>
                <th className="select-col">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length > 0 && 
                             selectedCourses.length === currentCourses.length}
                    onChange={handleSelectAll}
                    aria-label="Select all courses on this page"
                  />
                </th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Category</th>
                <th>Price</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCourses.length > 0 ? (
                currentCourses.map(course => (
                  <tr 
                    key={course.id} 
                    className={`course-row ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
                  >
                    <td className="select-col">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleSelectCourse(course.id)}
                        aria-label={`Select ${course.title}`}
                      />
                    </td>
                    <td className="course-title-cell">
                      <div className="course-title-wrapper">
                        {course.imageUrl && (
                          <img 
                            src={course.imageUrl} 
                            alt={course.title} 
                            className="course-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-course.png';
                            }}
                          />
                        )}
                        <div className="course-info">
                          <strong className="course-title">{course.title}</strong>
                          <div className="course-meta">
                            <span>{course.duration || 'N/A'}</span>
                            <span>•</span>
                            <span>Max {course.maxStudents || 0} students</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{course.instructor || 'N/A'}</td>
                    <td>
                      <span className={`category-tag ${course.category?.toLowerCase().replace(' ', '-') || 'uncategorized'}`}>
                        {course.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="price-cell">
                      ${typeof course.price === 'number' ? course.price.toFixed(2) : '0.00'}
                    </td>
                    <td>
                      <span className={`level-badge level-${course.level?.toLowerCase() || 'beginner'}`}>
                        {course.level || 'BEGINNER'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${course.status?.toLowerCase() || 'pending'}`}>
                        {course.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(course)} 
                          className="btn-action btn-edit"
                          aria-label={`Edit ${course.title}`}
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)} 
                          className="btn-action btn-delete"
                          aria-label={`Delete ${course.title}`}
                        >
                          🗑️
                        </button>
                        {course.status !== 'APPROVED' && (
                          <button 
                            onClick={() => handleApprove(course.id)} 
                            className="btn-action btn-approve"
                            aria-label={`Approve ${course.title}`}
                          >
                            ✅
                          </button>
                        )}
                        {course.status !== 'REJECTED' && (
                          <button 
                            onClick={() => handleReject(course.id)} 
                            className="btn-action btn-reject"
                            aria-label={`Reject ${course.title}`}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-results">
                  <td colSpan="8">
                    {courses.length ? 'No courses match your filters' : 'No courses found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCourses.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-info">
              Showing {(currentPage - 1) * coursesPerPage + 1} to{' '}
              {Math.min(currentPage * coursesPerPage, filteredCourses.length)} of{' '}
              {filteredCourses.length} courses
            </div>
            <div className="pagination-buttons">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-pagination"
              >
                Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-pagination"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {/* Course Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Course' : 'Add New Course'}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="modal-close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-grid">
                {/* Basic Info */}
                <div className="form-group">
                  <label htmlFor="course-title">Title *</label>
                  <input
                    id="course-title"
                    type="text"
                    name="title"
                    value={currentCourse.title}
                    onChange={handleChange}
                    required
                    placeholder="Course title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course-instructor">Instructor *</label>
                  <input
                    id="course-instructor"
                    type="text"
                    name="instructor"
                    value={currentCourse.instructor}
                    onChange={handleChange}
                    required
                    placeholder="Instructor name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course-category">Category</label>
                  <select
                    id="course-category"
                    name="category"
                    value={currentCourse.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="course-level">Level</label>
                  <select
                    id="course-level"
                    name="level"
                    value={currentCourse.level}
                    onChange={handleChange}
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing */}
                <div className="form-group">
                  <label htmlFor="course-price">Price *</label>
                  <div className="input-with-symbol">
                    <span>$</span>
                    <input
                      id="course-price"
                      type="number"
                      name="price"
                      value={currentCourse.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="course-max-students">Max Students</label>
                  <input
                    id="course-max-students"
                    type="number"
                    name="maxStudents"
                    value={currentCourse.maxStudents}
                    onChange={handleChange}
                    min="1"
                    placeholder="100"
                  />
                </div>

                {/* Dates */}
                <div className="form-group">
                  <label htmlFor="course-start-date">Start Date</label>
                  <input
                    id="course-start-date"
                    type="date"
                    name="startDate"
                    value={currentCourse.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="course-end-date">End Date</label>
                  <input
                    id="course-end-date"
                    type="date"
                    name="endDate"
                    value={currentCourse.endDate}
                    onChange={handleChange}
                  />
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label htmlFor="course-duration">Duration</label>
                  <input
                    id="course-duration"
                    type="text"
                    name="duration"
                    value={currentCourse.duration}
                    onChange={handleChange}
                    placeholder="e.g., 8 weeks"
                  />
                </div>

                {/* Image */}
                <div className="form-group">
                  <label htmlFor="course-image-url">Image URL</label>
                  <input
                    id="course-image-url"
                    type="url"
                    name="imageUrl"
                    value={currentCourse.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {currentCourse.imageUrl && (
                    <div className="image-preview">
                      <img 
                        src={currentCourse.imageUrl} 
                        alt="Course preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-course.png';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label htmlFor="course-description">Description *</label>
                  <textarea
                    id="course-description"
                    name="description"
                    value={currentCourse.description}
                    onChange={handleChange}
                    rows="5"
                    required
                    placeholder="Course description..."
                  />
                </div>

                {/* Tags */}
                <div className="form-group full-width">
                  <label htmlFor="course-tags">Tags (comma separated)</label>
                  <input
                    id="course-tags"
                    type="text"
                    name="tags"
                    value={currentCourse.tags}
                    onChange={handleChange}
                    placeholder="javascript, react, frontend"
                  />
                  <div className="tags-preview">
                    {currentCourse.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => (
                      <span key={tag} className="tag-preview">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update Course' : 'Create Course'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Bulk Actions</h3>
              <button 
                onClick={() => setShowBulkModal(false)} 
                className="modal-close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>You have selected {selectedCourses.length} course(s)</p>
              <div className="bulk-actions-grid">
                <button 
                  onClick={() => handleBulkAction('approve')} 
                  className="btn btn-approve"
                >
                  ✅ Approve Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')} 
                  className="btn btn-reject"
                >
                  ❌ Reject Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')} 
                  className="btn btn-delete"
                >
                  🗑️ Delete Selected
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowBulkModal(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Course Statistics</h3>
              <button 
                onClick={() => setShowStatsModal(false)} 
                className="modal-close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total Courses</div>
                </div>
                <div className="stat-card stat-approved">
                  <div className="stat-number">{stats.approved}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card stat-pending">
                  <div className="stat-number">{stats.pending}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card stat-rejected">
                  <div className="stat-number">{stats.rejected}</div>
                  <div className="stat-label">Rejected</div>
                </div>
                <div className="stat-card stat-avg-price">
                  <div className="stat-number">${stats.avgPrice.toFixed(2)}</div>
                  <div className="stat-label">Average Price</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowStatsModal(false)} 
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="modal-close"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this course? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={confirmDelete} 
                className="btn btn-delete"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admincourse;