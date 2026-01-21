import axios from "axios";
import { useState } from "react";

export const Register = () =>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [result, setResult] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if(password !== confirmPassword){
            alert("passwords do not match. ")
            return
        }
        const userInfo = {
            email: email,
            password: password
        }
        const api = 'http://localhost:8080/api/v1/registration';
        
        const auth = {
            username: 'admin',
            password: 'admin'
        }
        axios.post(api, userInfo,auth)
            .then(response => {
                console.log('success')
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setResult("Account created successfully")
            })
            .catch(error => {
                console.log('error')
                setResult('We can’t create an account with that email. Please sign in, or reset your password if you already have an account.')
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
            <div>{result}</div>
        </div>
    )
}

