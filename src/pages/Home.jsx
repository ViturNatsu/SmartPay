import { useAuth } from "../context/AuthContext"

export const Home = ()=>{
    const {user, logout} = useAuth();
    return <>
        <h1>Welcome, {user?.email}</h1>
        <button onClick={logout}>Logout</button>
    </>
}