const Forbidden = () => {
    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            fontFamily: 'sans-serif',
            color: '#333'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>403 Forbidden</h1>
            <p style={{ fontSize: '1.25rem' }}>User does not have access to this page.</p>
        </div>
    );
};

export default Forbidden;