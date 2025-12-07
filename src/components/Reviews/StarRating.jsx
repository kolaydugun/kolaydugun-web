import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, setRating, readOnly = false, size = 'medium' }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className={`star-rating ${size} ${readOnly ? 'read-only' : ''}`}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <label key={index}>
                        {!readOnly && (
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                onClick={() => setRating(ratingValue)}
                            />
                        )}
                        <span
                            className="star"
                            style={{
                                color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                                cursor: readOnly ? 'default' : 'pointer'
                            }}
                            onMouseEnter={() => !readOnly && setHover(ratingValue)}
                            onMouseLeave={() => !readOnly && setHover(0)}
                        >
                            &#9733;
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default StarRating;
