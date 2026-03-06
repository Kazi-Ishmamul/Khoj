import { Container } from 'react-bootstrap';

const AboutUs = () => {
    return (
        <Container className="my-5">
            <h1 className="mb-4 text-center">About Us</h1>
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <p className="lead">
                        Khoj is a dedicated platform to help individuals find their lost belongings and assist those who have found items in returning them to their rightful owners.
                    </p>
                    <p>
                        Our mission is to build a trustworthy community network that simplifies the process of recovering lost items. We believe that by creating an accessible and easy-to-use platform, we can increase the chances of happy reunions between people and their possessions.
                    </p>
                    <p className="mt-4 text-muted">
                        This is the "About Us" page placeholder.
                    </p>
                </div>
            </div>
        </Container>
    );
};

export default AboutUs;
