import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaBookOpen, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaGraduationCap,
  FaCertificate,
  FaHome,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaCog,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaClock,
  FaUserCheck,
  FaExclamationTriangle
} from "react-icons/fa";
import { MdTrendingUp as FaTrendingUp } from "react-icons/md";
import "./AdminHomePage.css";

const AdminHomepage = () => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    totalRevenue: 0,
    completedCourses: 0,
    pendingApprovals: 0,
    totalHours: 0
  });
  
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();
  const adminName = localStorage.getItem("adminName") || "Admin";
  const adminImage = localStorage.getItem("adminImage");

  // Fetch admin dashboard data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAdminStats(),
      fetchRecentUsers(),
      fetchRecentCourses(),
      fetchRecentTransactions(),
      fetchRecentActivities()
    ]).then(() => {
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching admin data:", err);
      setLoading(false);
    });
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        setAdminStats(data);
      } else {
        // Fallback to individual API calls if combined endpoint doesn't exist
        const [usersRes, coursesRes, transactionsRes] = await Promise.all([
          fetch("http://localhost:8080/api/users"),
          fetch("http://localhost:8080/api/courses"),
          fetch("http://localhost:8080/api/admin/transactions")
        ]);
        
        const users = await usersRes.json();
        const courses = await coursesRes.json();
        const transactions = await transactionsRes.json();
        
        setAdminStats({
          totalUsers: users.length || 0,
          activeCourses: courses.length || 0,
          totalRevenue: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
          completedCourses: courses.filter(c => c.status === 'completed').length || 0,
          pendingApprovals: courses.filter(c => c.status === 'pending').length || 0,
          totalHours: courses.reduce((sum, c) => sum + (c.duration || 0), 0)
        });
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/users/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentUsers(data.slice(0, 5));
      } else {
        // Fallback
        const response = await fetch("http://localhost:8080/api/users");
        const users = await response.json();
        setRecentUsers(users.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching recent users:", error);
    }
  };

  const fetchRecentCourses = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/courses");
      const data = await response.json();
      setRecentCourses(data.slice(0, 4));
    } catch (error) {
      console.error("Error fetching recent courses:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/transactions/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/admin/activities/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.slice(0, 6));
      } else {
        // Mock data as fallback
        setRecentActivities([
          { id: 1, type: 'user_registration', message: 'New user registered', user: 'John Doe', timestamp: new Date().toISOString() },
          { id: 2, type: 'course_completion', message: 'Course completed', user: 'Jane Smith', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
          { id: 3, type: 'payment', message: 'Payment received', user: 'Mike Johnson', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
        ]);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className={`admin-dashboard-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-brand">Dorcas Admin</h2>
          <button className="admin-sidebar-toggle" onClick={toggleSidebar}>
            ≡
          </button>
        </div>
        
        <div className="admin-user-profile-sidebar">
          <img src={adminImage || "/admin-avatar.png"} alt="Admin Profile" />
          <span>{adminName}</span>
        </div>
        
        <nav className="admin-sidebar-nav">
          <Link to="/adminhome" className="admin-nav-item active">
            <FaHome className="admin-nav-icon" />
            <span className="admin-nav-text">Dashboard</span>
          </Link>
          <Link to="/admin/users" className="admin-nav-item">
            <FaUsers className="admin-nav-icon" />
            <span className="admin-nav-text">User Management</span>
          </Link>
          <Link to="/admincourse" className="admin-nav-item">
            <FaBookOpen className="admin-nav-icon" />
            <span className="admin-nav-text">Courses</span>
          </Link>
          <Link to="/admintransactions" className="admin-nav-item">
            <FaMoneyBillWave className="admin-nav-icon" />
            <span className="admin-nav-text">Transactions</span>
          </Link>
          <Link to="/analyticsdashboard" className="admin-nav-item">
            <FaChartLine className="admin-nav-icon" />
            <span className="admin-nav-text">Analytics</span>
          </Link>
          <Link to="/admin" className="admin-nav-item">
            <FaCog className="admin-nav-icon" />
            <span className="admin-nav-text">Settings</span>
          </Link>
          <button className="admin-logout admin-nav-item" onClick={handleLogout}>
            <FaSignOutAlt className="admin-nav-icon" />
            <span className="admin-nav-text">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title">Admin Dashboard</h1>
          </div>
          
          <div className="admin-topbar-right">
            <div className="admin-search-container">
              <FaSearch className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search users, courses, transactions..."
                className="admin-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="admin-notification-bell">
              <FaBell />
              <span className="admin-notification-badge">{adminStats.pendingApprovals}</span>
            </div>
            
            <div className="admin-profile-link">
              <img
                src={adminImage || "/admin-avatar.png"}
                alt="Admin Profile"
                className="admin-profile-avatar"
              />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <section className="admin-welcome-section">
          <div className="admin-welcome-text">
            <h2>Welcome back, {adminName}! 👋</h2>
            <p>Here's what's happening in your learning platform today.</p>
          </div>
          <div className="admin-welcome-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-icon users">
                <FaUsers />
              </div>
              <div className="admin-stat-info">
                <h3>{adminStats.totalUsers}</h3>
                <p>Total Users</p>
                <span className="admin-stat-change positive">+12% this month</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon courses">
                <FaBookOpen />
              </div>
              <div className="admin-stat-info">
                <h3>{adminStats.activeCourses}</h3>
                <p>Active Courses</p>
                <span className="admin-stat-change positive">+8% this month</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon revenue">
                <FaMoneyBillWave />
              </div>
              <div className="admin-stat-info">
                <h3>{formatCurrency(adminStats.totalRevenue)}</h3>
                <p>Total Revenue</p>
                <span className="admin-stat-change positive">+15% this month</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon hours">
                <FaClock />
              </div>
              <div className="admin-stat-info">
                <h3>{adminStats.totalHours}h</h3>
                <p>Learning Hours</p>
                <span className="admin-stat-change positive">+23% this month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="admin-quick-actions-section">
          <div className="admin-section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="admin-quick-actions">
            <Link to="/admincourse" className="admin-action-card">
              <FaPlus className="admin-action-icon" />
              <span>Add New Course</span>
            </Link>
            <Link to="/admin/users" className="admin-action-card">
              <FaUserCheck className="admin-action-icon" />
              <span>Manage Users</span>
            </Link>
            <Link to="/analyticsdashboard" className="admin-action-card">
              <FaTrendingUp className="admin-action-icon" />
              <span>View Analytics</span>
            </Link>
            <Link to="/admintransactions" className="admin-action-card">
              <FaMoneyBillWave className="admin-action-icon" />
              <span>Review Transactions</span>
            </Link>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="admin-recent-activity-section">
          <div className="admin-section-header">
            <h2>Recent Activity</h2>
            <Link to="/admin/activities" className="admin-see-all-link">See All</Link>
          </div>
          
          <div className="admin-activity-list">
            {loading ? (
              <div className="admin-loading-spinner">Loading activities...</div>
            ) : (
              recentActivities.map(activity => (
                <div key={activity.id} className="admin-activity-item">
                  <div className="admin-activity-icon">
                    {activity.type === 'user_registration' && <FaUserCheck />}
                    {activity.type === 'course_completion' && <FaGraduationCap />}
                    {activity.type === 'payment' && <FaMoneyBillWave />}
                    {activity.type === 'course_creation' && <FaBookOpen />}
                  </div>
                  <div className="admin-activity-content">
                    <p className="admin-activity-message">{activity.message}</p>
                    <span className="admin-activity-user">{activity.user}</span>
                    <span className="admin-activity-time">{getTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Users */}
        <section className="admin-recent-users-section">
          <div className="admin-section-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users" className="admin-see-all-link">See All</Link>
          </div>
          
          <div className="admin-users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">Loading users...</td>
                  </tr>
                ) : (
                  recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-info">
                          <img src={user.profileImage || "/default-avatar.png"} alt={user.name} />
                          <span>{user.name || user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.createdAt || user.joinDate)}</td>
                      <td>
                        <span className={`admin-status ${user.status || 'active'}`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-user-actions">
                          <button className="admin-action-btn view" title="View">
                            <FaEye />
                          </button>
                          <button className="admin-action-btn edit" title="Edit">
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Courses */}
        <section className="admin-recent-courses-section">
          <div className="admin-section-header">
            <h2>Recent Courses</h2>
            <Link to="/admincourse" className="admin-see-all-link">See All</Link>
          </div>
          
          <div className="admin-courses-grid">
            {loading ? (
              <div className="admin-loading-spinner">Loading courses...</div>
            ) : (
              recentCourses.map(course => (
                <div key={course.id} className="admin-course-card">
                  <div className="admin-course-thumbnail">
                    <img src={course.imageUrl || "/course-placeholder.jpg"} alt={course.title} />
                    <div className="admin-course-status">{course.status || "Active"}</div>
                  </div>
                  <div className="admin-course-info">
                    <h3 className="admin-course-title">{course.title}</h3>
                    <p className="admin-course-instructor">by {course.instructor}</p>
                    <div className="admin-course-meta">
                      <span className="admin-course-enrollments">
                        <FaUserCheck />
                        {course.enrollments || 0} enrolled
                      </span>
                      <span className="admin-course-duration">
                        <FaClock />
                        {course.duration || "6h"}
                      </span>
                    </div>
                    <div className="admin-course-actions">
                      <button className="admin-course-action-btn view">
                        <FaEye />
                      </button>
                      <button className="admin-course-action-btn edit">
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Alerts */}
        <section className="admin-alerts-section">
          <div className="admin-section-header">
            <h2>System Alerts</h2>
          </div>
          
          <div className="admin-alerts">
            {adminStats.pendingApprovals > 0 && (
              <div className="admin-alert warning">
                <FaExclamationTriangle />
                <div className="admin-alert-content">
                  <h4>Pending Course Approvals</h4>
                  <p>{adminStats.pendingApprovals} courses are waiting for approval</p>
                  <Link to="/admincourse" className="admin-alert-action">Review Now</Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="admin-dashboard-footer">
          <p>&copy; {new Date().getFullYear()} Dorcas Learning Platform - Admin Panel. All rights reserved.</p>
          <div className="admin-footer-links">
            <a href="/admin/help">Help Center</a>
            <a href="/admin/support">Support</a>
            <a href="/admin/documentation">Documentation</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminHomepage;