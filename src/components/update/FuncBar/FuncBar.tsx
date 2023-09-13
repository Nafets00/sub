import "./FuncBar.scss"
import CreateEncounter from "../CreateEncounter/CreateEncounter"
import SingleEncounterUpload from "../SingleEncounterUpload/SingleEncounterUpload"
import { useState } from "react"
const FuncBar = () => {
    const [mode, setMode] = useState('')
    function createNewEncounter(){
            setMode('newEncounter')
            }
    function showSingleEncounterUpload(){
        setMode('showSingleEncounterUpload')

    }

    return(
        <div>
        {mode == 'newEncounter' && <CreateEncounter/> }
        {mode == 'showSingleEncounterUpload' && <SingleEncounterUpload/>}
        <div className="bar">
               <div className="bar-button-container">
                <button className="bar-button" onClick={createNewEncounter}>Create new encounters</button>
                </div>

                <div className="bar-button-container">
                    <button className="bar-button" onClick={showSingleEncounterUpload}>Single encounter upload</button>
                </div> 
        </div>
        </div>
    )
}
export default FuncBar
