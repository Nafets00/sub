import { useCallback, useEffect, useState } from "react"
import './authentication.scss'
import {useCookies} from 'react-cookie'
import ElectronLog from "electron-log"
export default function () {
    
    const [cookies, setCookie, removeCookie] = useCookies()
    const [error, setError] = useState<null | String>(null)
    const [email, setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [token, setToken] = useState('')
    
    const useToken = useEffect(() => {
        localStorage.setItem("Atoken", token)
        setCookie('AuthToken', token)  
    }, [token]) 
    
    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try{
        const response = await fetch(`https://devel.whalee.io/api/authentication/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })
        const data = await response.json()
        if(!data.isAuthSuccessful){
            ElectronLog.warn(`logging was not successful ${data.errorMessage}`)
            setError(data.errorMessage) 
        }else{
            ElectronLog.info("logging was successful")
            setToken(data.token)
        }
    }
        catch(error){
            ElectronLog.error(`Server error: ${error}`)
            setError("Could not connect to server, please try again later")
        }
        
    }



return(
    <div className="auth-container">
        <div className="auth-container-box">
            <form>
                <h2>Please log in</h2>
                <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)}/>
                <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)}/>
                <input type="submit" className="create" onClick={(e) => handleSubmit(e)}/>
                {error && <p>{error}</p>}
            </form>
        </div>
    </div>
)

}