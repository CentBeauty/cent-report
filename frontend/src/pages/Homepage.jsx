import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap"
import QuarteRevenue from "../components/dashboards/QuarterRevenue";
export default function Homepage() {
    useEffect(() => {
        document.title = 'Home page';
    }, [])
    return (
        <Container fluid>
            <Row>
                <Col xxl={6} xs={12}>
                    <QuarteRevenue />
                </Col>
                <Col xxl={6} xs={12}>
                    
                </Col>
            </Row>
        </Container>
    );
}