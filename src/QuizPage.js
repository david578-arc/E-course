import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizPage() {
    const { courseId } = useParams();
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8080/api/quizzes/${courseId}`)
            .then((response) => response.json())
            .then((data) => setQuizzes(data));
    }, [courseId]);

    return (
        <div>
            <h2>Quizzes</h2>
            {quizzes.map((quiz) => (
                <div key={quiz.id}>
                    <p>{quiz.question}</p>
                    <button>{quiz.optionA}</button>
                    <button>{quiz.optionB}</button>
                    <button>{quiz.optionC}</button>
                    <button>{quiz.optionD}</button>
                </div>
            ))}
        </div>
    );
}

export default QuizPage;