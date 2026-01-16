import { useState } from "react";

export const Register = () =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const handleSubmit = (e) => {
        const userInfo = {
            email: email,
            password: password
        }
        const api = 'http://localhost:8080/api/v1/registration';
        e.preventDefault();

        axios.post(api, userInfo)
            .then(response => {
                console.log('success')
            })
            .catch(error => {
                console.log('error')
            })

    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />

                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button type="submit">
                Create Account
                </button>
            </form>
        </div>
    )
}

