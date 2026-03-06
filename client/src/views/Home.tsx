import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container className="my-5">
      <Row className="align-items-center mb-5">
        <Col md={6}>
          <h1 className="display-4 fw-bold mb-4">Welcome to Khoj</h1>
          <p className="lead mb-4">
            Your community-driven lost and found platform. Lost something precious? Found an item that doesn't belong to you? We're here to help connect people with their belongings.
          </p>
          <div className="d-flex gap-3">
            <Link to="/register"><Button variant="primary" size="lg">Get Started</Button></Link>
            <Link to="/about"><Button variant="outline-secondary" size="lg">Learn More</Button></Link>
          </div>
        </Col>
        <Col md={6}>
          <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=1000" alt="Lost and Found" className="img-fluid rounded shadow" />
        </Col>
      </Row>

      <Row className="g-4 mt-5">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center p-4">
              <div className="display-4 mb-3">🔍</div>
              <Card.Title>Report Lost Items</Card.Title>
              <Card.Text>
                Post details about what you've lost, where you lost it, and let the community help you find it.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center p-4">
              <div className="display-4 mb-3">🤝</div>
              <Card.Title>Report Found Items</Card.Title>
              <Card.Text>
                Found something? Post it here and help someone reunite with their lost belongings.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center p-4">
              <div className="display-4 mb-3">✨</div>
              <Card.Title>Connect & Resolve</Card.Title>
              <Card.Text>
                Communicate securely through our platform to arrange the safe return of items.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
