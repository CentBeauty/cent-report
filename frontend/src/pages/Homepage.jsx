import { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap"
import QuarteRevenue from "../components/dashboards/QuarterRevenue";
import HeaderDashBoard from "../components/dashboards/Header";
export default function Homepage() {
    useEffect(() => {
        document.title = 'Home page';
    }, [])
    return (
        <Container fluid>
            <HeaderDashBoard />
            <Row className="mt-3">
                <Col xxl={6} xs={12}>
                    <QuarteRevenue />
                </Col>
                <Col xxl={6} xs={12}>

                </Col>
            </Row>
        </Container>
    );
}