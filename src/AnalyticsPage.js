import React, { useEffect, useState } from 'react';

function AnalyticsPage() {
    const [completionRates, setCompletionRates] = useState({});

    useEffect(() => {
        fetch('http://localhost:8080/api/analytics/completion-rate')
            .then((response) => response.json())
            .then((data) => setCompletionRates(data));
    }, []);

    return (
        <div>
            <h2>Course Completion Rates</h2>
            <ul>
                {Object.entries(completionRates).map(([courseId, rate]) => (
                    <li key={courseId}>
                        Course {courseId}: {Math.round(rate * 100)}%
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AnalyticsPage;