import "./ToolHeader.scss"
import Update from '@/components/update'
import orcaIconCircle from '../../../assets/orca-icon-circle.png'



const ToolHeader = () => {
function signOut(){ 
    localStorage.removeItem("Atoken")
    window.location.reload()
    
  }

    return (
        <div className="Head">
            <div className="title">
                 <img src={orcaIconCircle} className='logo-fin'  /> 
                 <h1 className="Fwave">Finwave</h1>
            </div>
            <div className="right-container">
                <div className="button-container">
                    <Update />
                </div>
                <div className="button-container">
                <button className='signout' onClick={signOut}>Sign out</button>
                </div>
            </div>
        </div>
    )
}
export default ToolHeader
