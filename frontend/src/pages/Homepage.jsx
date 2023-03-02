import { useEffect } from "react";

export default function Homepage() {
    useEffect(() => {
        document.title = 'Home page';
    }, [])
    return (
        <>
            <div className="wrapper">
                <h1>Welcome back</h1>
            </div>
        </>
    );
}