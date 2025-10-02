import { LOGO_IMAGE } from "../../config"
import React  from "react"

const AuthContainer = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex items-center justify-center h-screen w-screen">
            <div className="w-full max-w-md flex items-center justify-center">
                <div className="w-full bg-white p-5 rounded-2xl shadow">
                    <div className="w-full flex items-center justify-center">
                        <img src={LOGO_IMAGE} className="w-24 h-24" alt="acepick" />
                    </div>
                    {children}
                </div>
            </div>
            
        </div>
    )
}
export default AuthContainer