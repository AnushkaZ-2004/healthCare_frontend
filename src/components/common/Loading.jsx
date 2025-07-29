import React from 'react';
import '../../styles/global.css';

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        </div>
    );
};

export default Loading;