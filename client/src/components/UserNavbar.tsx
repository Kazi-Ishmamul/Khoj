import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const UserNavbar = () => {
    return (
        <Navbar bg="light" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">Khoj</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/user-dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/user-dashboard/items">Items/Products</Nav.Link>
                        <Nav.Link as={Link} to="/user-dashboard/activity">My Activity</Nav.Link>
                        <Nav.Link as={Link} to="/user-dashboard/notifications">Notifications 🔔</Nav.Link>
                        <Nav.Link as={Link} to="/user-dashboard/profile">Profile</Nav.Link>
                        <Nav.Link as={Link} to="/">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default UserNavbar;
