import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Image, Badge, InputGroup } from 'react-bootstrap';

const Profile = () => {
    // DUMMY DATA (Simulating data pulled from Reg/Database)
    // To pull real data: const [user, setUser] = useState(fetchedUserData);
    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "john.doe@example.com", // Not editable
        contact: "+1 234 567 890",
        address: "123 Maple Street, Springfield",
        status: "User", // Always 'User' per your requirement
        profilePic: "https://i.pravatar.cc/150?u=foundit",
        github: "",
        linkedin: "",
        twitter: ""
    });

    // Handle dummy change (Frontend logic only)
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Frontend logic: Data ready to be sent to Backend!");
        /* BACKEND CODE COMMENT:
           axios.put('/api/user/update', userData)
                .then(res => console.log("Database Updated"))
                .catch(err => console.error(err));
        */
    };

    return (
        <Container className="my-5">
            <Row>
                {/* LEFT SIDE: Profile Summary & Identity */}
                <Col md={4} className="mb-4">
                    <Card className="text-center shadow-sm border-0">
                        <Card.Body>
                            <div className="position-relative d-inline-block mb-3">
                                <Image
                                    src={userData.profilePic}
                                    roundedCircle
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #f8f9fa' }}
                                />
                                {/* Change Photo Button (Mock Feature) */}
                                <Button
                                    variant="dark"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle"
                                    onClick={() => alert("Upload logic goes here (Frontend only)")}
                                >
                                    ✎
                                </Button>
                            </div>

                            <h2 className="fw-bold">{userData.name}</h2>
                            <Badge bg="info" className="mb-3 px-3 py-2 text-uppercase">
                                {userData.status}
                            </Badge>

                            <hr />

                            <div className="text-start">
                                <p className="small text-muted mb-1">Email</p>
                                <p className="fw-medium">{userData.email}</p>

                                <p className="small text-muted mb-1 mt-3">Address</p>
                                <p className="fw-medium">{userData.address}</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT SIDE: Editable Info & Social Links */}
                <Col md={8}>
                    <Card className="shadow-sm border-0 p-3">
                        <Card.Body>
                            <h4 className="mb-4">Account Settings</h4>
                            <Form onSubmit={handleUpdate}>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Email (Permanent)</Form.Label>
                                            <Form.Control type="email" value={userData.email} disabled />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Contact Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userData.contact}
                                                onChange={(e) => setUserData({ ...userData, contact: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label>Home Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={userData.address}
                                                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h5 className="mt-4 mb-3">Social Links (Optional)</h5>
                                <p className="text-muted small">Update these to help people reach you regarding lost items.</p>

                                <Form.Group className="mb-3">
                                    <InputGroup>
                                        <InputGroup.Text>LinkedIn</InputGroup.Text>
                                        <Form.Control
                                            placeholder="URL"
                                            onChange={(e) => setUserData({ ...userData, linkedin: e.target.value })}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <InputGroup>
                                        <InputGroup.Text>GitHub</InputGroup.Text>
                                        <Form.Control
                                            placeholder="URL"
                                            onChange={(e) => setUserData({ ...userData, github: e.target.value })}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <div className="d-flex justify-content-end">
                                    <Button variant="primary" type="submit" className="px-5">
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;