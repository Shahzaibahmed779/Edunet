import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const RouteProtect = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            setUser(userData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #0b0c10 0%, #1e3a8a 50%, #133d89 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.2rem',
                zIndex: 9999
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '3px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || !user._id) {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

export default RouteProtect;
