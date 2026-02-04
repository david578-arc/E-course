import React, { useEffect, useState } from 'react';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/users')
            .then((response) => response.json())
            .then((data) => setUsers(data));

        fetch('http://localhost:8080/api/courses')
            .then((response) => response.json())
            .then((data) => setCourses(data));
    }, []);

    return (
        <div>
            <h2>Admin Dashboard</h2>

            <h3>Users</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.username} - {user.email}</li>
                ))}
            </ul>

            <h3>Courses</h3>
            <ul>
                {courses.map((course) => (
                    <li key={course.id}>{course.title} - {course.instructor}</li>
                ))}
            </ul>
        </div>
    );
}

export default AdminDashboard;