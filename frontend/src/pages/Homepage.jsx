import { useEffect } from "react";

export default function Homepage() {
    useEffect(() => {
        document.title = 'Home page';
    }, [])
    console.log("import.meta.env.VITE_PORT",import.meta.env.VITE_PORT)
    return (
        <>
            <div className="wrapper">
                <h1>Welcome back</h1>
            </div>
        </>
    );
}