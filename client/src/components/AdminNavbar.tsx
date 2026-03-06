import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AdminNavbar = () => {
    return (
        <Navbar bg="light" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/">Khoj Admin</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/admin-dashboard/manage-posts">Manage Posts</Nav.Link>
                        <Nav.Link as={Link} to="/admin-dashboard/reports">Reports</Nav.Link>
                        <Nav.Link as={Link} to="/admin-dashboard/history">History</Nav.Link>
                        <Nav.Link as={Link} to="/admin-dashboard/helpdesk">Helpdesk</Nav.Link>
                        <Nav.Link as={Link} to="/">Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AdminNavbar;
