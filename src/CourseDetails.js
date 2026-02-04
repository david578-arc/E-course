import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CourseDetails() {
    const { courseId } = useParams(); // Extract courseId from URL
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                console.log('Fetching course details for ID:', courseId);
                const response = await axios.get(`/api/courses/${courseId}`);
                console.log('API Response:', response.data);
                setCourse(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching course details:', err);
                setError('Failed to load course details.');
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    if (loading) {
        return <p>Loading course details...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!course) {
        return <p>Course not found.</p>;
    }

    return (
        <div className="course-details">
            <h1>{course.title}</h1>
            <p><strong>Instructor:</strong> {course.instructor}</p>
            <p><strong>Description:</strong> {course.description}</p>
            <p><strong>Duration:</strong> {course.duration}</p>
            <button onClick={() => alert('Enroll functionality to be implemented')}>
                Enroll Now
            </button>
            <br />
            <Link to="/">Back to Home</Link>
        </div>
    );
}

export default CourseDetails;