import "./SingleEncounterUpload.scss"
import { useEffect, useState } from "react"
import { MultiSelect } from "react-multi-select-component"
import ElectronLog from "electron-log"
import exifr, { Exifr } from "exifr"
const{v4: uuidv4} = require('uuid')
const SingleEncounterUpload = () =>{
    
    type labval = {
        label: any,
        value: any
    }
    let sucCounter = 0
    let counterForImages = 0
    const [success, setSuccess] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const[population, setPopulation] = useState("")
    const[contributor, setContributor] = useState("")
    const[contributorFirstName, setContributorFirstName] = useState("")
    const[contributorLastName, setContributorLastName] = useState("")
    const[contributorEmail, setContributorEmail] = useState("")
    const[contributorUsername, setContributorUsername] = useState("")
    const[contributorInformUser, setContributorInformUser] = useState("")
    const[date, setDate] = useState("")
    const[predEvent, setPredEvent] = useState("")
    const[selectedBehaviors, setSelectedBehaviors] = useState<labval[]>([])
    const[selectedOrganizations, setSelectedOrganizations] = useState<labval[]>([])
    const[notes, setNotes] = useState("")
    const[latitude, setLatitude] = useState("")
    const[longitude, setLongitude] = useState("")
    const[locationName, setLocationName] = useState("")
    
    const[error, setError] = useState("no images selected")
    const[displayError, setDisplayError] = useState(false)

    const[organizationArray, setOrganizationArray] = useState<labval[]>([])
    const[behaviorArray, setBehaviorArray] = useState<labval[]>([])
    const[populationArray, setPopulationArray] = useState<labval[]>([])
    const[ContributionArray, setContributionArray] = useState<labval[]>([])

    let[populationMultiselect, setPopulationMultiselectselect ] = useState([])
    let[contributionMultiselect, setContributionMultiselect] = useState([])
    let[completionMultiselect, setCompletionMultiselect] = useState<labval[]>([])
    
    if (populationMultiselect.length > 1) {
    populationMultiselect = populationMultiselect.slice(1)
    }
    if(contributionMultiselect.length > 1) {
        contributionMultiselect = contributionMultiselect.slice(1)
    }
    if(completionMultiselect.length > 1){
        completionMultiselect = completionMultiselect.slice(1)
    }

    const behaviorStrings = {
    "selectSomeItems": "Select behaviors",
    }
    const organizationStrings = {
    "selectSomeItems": "Select organizations",
    }
    const populationStrings = {
    "selectSomeItems": "Select a population*"
    }
    const contributionStrings = {
    "selectSomeItems": "Select a contributor*"
    }
    const completionStrings = {
        "selectSomeItems": "Select completion status*"
    }
    const completionArray: labval[] = [{label: "complete", value:"complete"}, {label: "incomplete", value: "incomplete"}, {label: "unknown", value: "unknown"}]
    

    useEffect(() => {
        userPopulation()
    }, [""])

    function handlePopChange(values: any) {
        
        setPopulationMultiselectselect(values)
        setContributionMultiselect([])
        setOrganizationArray([])
        setBehaviorArray([])
        setContributionArray([])
        setSelectedBehaviors([])
        setSelectedOrganizations([])
        if(values.length > 0)
        {
            let id = values[values.length-1].value
            setPopulation(id)
            userOrganization()
            userContribution(id)
            userBehaviour(id)
        }
    }
    function handleConChange(event: any){
        setContributionMultiselect(event)
        if(event.length > 0)
        {
            let con = event[event.length-1].value
            setContributor(con[0])
            setContributorFirstName(con[1])
            setContributorLastName(con[2])
            setContributorEmail(con[3])
            setContributorUsername(con[4])
            setContributorInformUser(con[5])
        }
         
    }   

    async function userPopulation() {
        let tempArray = []
        const token = localStorage.getItem("Atoken")
        try{
        const getPop = await fetch(`https://devel.whalee.io/api/Population/user`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`}, })
        const data = await getPop.json()
        
        for(let i = 0; i<data.length; i++)
        {
            let obj : labval = {
                label: data[i].displayName,
                value: data[i].id
            }
            tempArray.push(obj)
        }
        
        setPopulationArray(tempArray)
    }
    catch(error)
    {
        //ElectronLog.error(`failed to fetch populations: ${error}`)
        setError(`Failed to fetch populations please load again`)
        setDisplayError(true)
    }
    }

    async function userOrganization() {
        let tempArray = []
        const token = localStorage.getItem("Atoken")
        try
        {const getOrg = await fetch(`https://devel.whalee.io/api/Organization`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`}, })
        const data = await getOrg.json()
        for(let i = 0; i<data.length; i++)
        {
            let obj: labval = {
                label: data[i].name,
                value: data[i].id
            }
            tempArray.push(obj)
        }
        setOrganizationArray(tempArray)}
        catch(error)
        {
        //ElectronLog.error(`failed to fetch organizations: ${error}`)
        setError(`Failed to fetch organizations please load again or check the logs`)
        setDisplayError(true)
        }
    }

    async function userBehaviour(population: string) {
        let arrTemp = []
        const token = localStorage.getItem("Atoken")
        try{
            const getBeh = await fetch(`https://devel.whalee.io/api/Population/${population}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`}, })
        const data = await getBeh.json()
        for(let i = 0; i<data.behaviors.length; i++)
        {
            let obj : labval= {
                label: data.behaviors[i].description,
                value: data.behaviors[i].id
            }
            arrTemp.push(obj)
        }
        setBehaviorArray(arrTemp)
        }
        catch(error)
        {
            //ElectronLog.error(`failed to fetch behaviours: ${error}`)
            setError(`Failed to fetch behaviours please load again or check logs`)
            setDisplayError(true)
        }
    }

    async function userContribution(population: string) {
        let tempArray = []
        const token = localStorage.getItem("Atoken")
        try{
            const getOwn = await fetch(`https://devel.whalee.io/api/Profile/profile`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`},
            })
            const ownData = await getOwn.json()
            const ownID = ownData.id

            const getCon = await fetch(`https://devel.whalee.io/api/Population/${population}/users`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`},})
        const data = await getCon.json()  
        for(let i = 0; i<data.length; i++)
        { 
            let obj : labval= {
                label: data[i].userProfileDto.firstName.concat(" ", data[i].userProfileDto.lastName),
                value: [data[i].userProfileDto.id, 
                        data[i].userProfileDto.firstName, 
                        data[i].userProfileDto.lastName, 
                        data[i].userProfileDto.email,
                        data[i].userProfileDto.username,
                        data[i].userProfileDto.informUser]
            }

            if((data[i].userProfileDto.id === ownID) && (data[i].roleName != "Administrator"))
            {
                tempArray = []
                tempArray.push(obj)
                break
            }
            tempArray.push(obj)
        }
        setContributionArray(tempArray)
        }
        catch(error){
            //ElectronLog.error(`failed to fetch contributors: ${error}`)
            setError(`Failed to fetch contributors please load again or check logs`)
            setDisplayError(true)
        }
    }

    function checkValidity(len: any){
        if(population === "")
        {
            setError("Please select a population")
            //ElectronLog.warn("tried to upload single encounter but no population was selected")
            return false
        }
        if(contributionMultiselect.length === 0)
        {
            setError("Please choose either a contributor or yourself")
            //ElectronLog.warn("tried to upload single encounter but no contributor was selected")
            return false        
        }
        if(date === ""){
            setError("Please choose a date")
            //ElectronLog.warn("tried to upload single encounter but no date was selected")
            return false
        }
        if(predEvent === ""){
            setError("Please select 'yes' or 'no'")
            //ElectronLog.warn("tried to upload single encounter but no predation option was selected")
            return false
        }
        if(latitude === ""){
            setError("Please give a latitude")
            //ElectronLog.warn("tried to upload single encounter but no latitude was given")
            return false
        }
        if(longitude === ""){
            setError("Please give a longitude")
            //ElectronLog.warn("tried to upload single encounter but no longitude was given")
            return false
        }
        if(locationName === ""){
            setError("Please give the name of the location")
            //ElectronLog.warn("tried to upload single encounter but no location was given")
            return false
        }
        if(len === 0)
        {
            setError("There are no files in your upload")
            //ElectronLog.warn("tried to upload single encounter but no images were selected")
            return false
        }
        return true
    }
    async function handleSubmit(event: any){
        event.preventDefault()
        const token = localStorage.getItem("Atoken")
        let organizationIds = []
        let encounterBehaviors = []
        
        for(let i = 0; i<selectedOrganizations.length; i++)
        {organizationIds.push(selectedOrganizations[i].value)}
        for(let i = 0; i<selectedBehaviors.length; i++)
        {   let tempBeh = {"id": selectedBehaviors[i].value}
            encounterBehaviors.push(tempBeh)}
        

        var images = (document.getElementById("seImages") as HTMLInputElement).files
        if(images === null || (!checkValidity(images.length)))
        {
            setDisplayError(true)
        }
        else{
            let radioVal = false
            let iUser = false
            let completionStatus = completionMultiselect[0].value
            let compStatus
            if(predEvent === "true")
            {
                radioVal = true
            }
            if(contributorInformUser === "true")
            {
                iUser = true
            }
            if(completionStatus === "complete")
            {
                compStatus = true
            }
            else if(completionStatus === "incomplete")
            {
                compStatus = false
            }

            console.log(notes, locationName, latitude, longitude, date, organizationIds, population, radioVal, contributor, contributorFirstName, contributorLastName, contributorEmail, contributorUsername, iUser, compStatus, encounterBehaviors);
            try
            {const response = await fetch(`https://devel.whalee.io/api/encounter`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`},
            body: JSON.stringify( 
                {"name": "",
                "description": notes, 
                "location": {  
                "name": locationName,
                "latitude": latitude,
                "longitude": longitude
                }, 
                "dateTime": date,
                "organizationIds": organizationIds,
                "populationId": population,
                "predationEvent": radioVal,
                "predationTargets": [],
                "submissionUser": {
                  "id": contributor,
                  "firstName": contributorFirstName,
                  "lastName": contributorLastName,
                  "email": contributorEmail,
                  "username": contributorUsername,
                  "informUser": iUser},
                "informNewUser": false,
                "complete": compStatus,
                "encounterBehaviors": encounterBehaviors}
                )
        })
        const data = await response.json()
        console.log(data)
        uploadImages(images, data.id)

        let dis = document.getElementById("display")
        if(dis != null){
            dis.remove()
            setShowSuccess(true)
        }}
        catch(error){
            //ElectronLog.error(`failed to upload encounter: ${error}`)
            setError(`Failed to upload encounter please try again or check the logs`)
            setDisplayError(true)
        }
        }
    }
    async function uploadImages(images: FileList, encounterid: string) {
        const token = localStorage.getItem("Atoken")
        for(let i = 0; i<images.length; i++)
        {  
            try
            {
            let metadata = await exifr.parse(images[i])
            counterForImages++
            const formData = new FormData()
            formData.append("file", images[i], images[i].name)
            const imageID = uuidv4()
            const response = await fetch(`https://devel.whalee.io/api/file/upload/${population}/${encounterid}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData
            }
            )
            console.log(response)
            sucCounter++
            setSuccess(`successfully uploaded ${sucCounter} of ${counterForImages} images`)
            }
            catch(error)
            {
                //ElectronLog.warn(`not able to upload ${images[i].name} either not an image or failed upload`)
            }
            
        }
    }
    return(
        <div className="singleEncounterUpload">
            <div className="plate">
                <div className="display">
                    <form className="encouterUploadForm">
                        <div className="leftcolumn">
                            <MultiSelect className="multiselect" options={populationArray} value={populationMultiselect} onChange={(event: any) => handlePopChange(event)} hasSelectAll={false} overrideStrings={populationStrings} labelledBy={"lebel"} closeOnChangedValue={true}/>
                            <MultiSelect className="multiselect" options={ContributionArray} value={contributionMultiselect} onChange={(event: any) => handleConChange(event)} hasSelectAll={false} overrideStrings={contributionStrings} labelledBy="label" closeOnChangedValue={true}/>
                            <input type="date" className="seuDate" id="encounterDate" onChange={(event) => setDate(event.target.value)}/>
                            <div className="selectPredationEvent">
                                <h2 className="predEvent">Predation Event?*</h2>
                                <label>
                                    <input type="radio" name="predRad" value="true" onChange={(event) => setPredEvent(event.target.value)}/>
                                    <span>Yes</span>
                                </label>
                                <label>
                                    <input type="radio" name="predRad" value="false" onChange={(event) => setPredEvent(event.target.value)}/>
                                    <span>No</span>
                                </label>
                            </div>
                            <MultiSelect className="multiselect" options={completionArray} value={completionMultiselect} onChange={setCompletionMultiselect} hasSelectAll={false} overrideStrings={completionStrings} labelledBy={"lebel"} closeOnChangedValue={true}/>
                        </div>
                        <div className="rightcolumn">
                            <input type="text" id="latitude" className="seuInput" placeholder="Latitude*" onChange={(event) => setLatitude(event.target.value)}/>
                            <input type="text" id="longitude"className="seuInput" placeholder="Longitude*" onChange={(event) => setLongitude(event.target.value)}/>
                            <input type="text" id="locationName" className="locationNameInput" placeholder="Location Name*" onChange={(event) => setLocationName(event.target.value)}/>
                            <MultiSelect className="multiselect" options={behaviorArray} value={selectedBehaviors} onChange={setSelectedBehaviors} hasSelectAll={false} overrideStrings={behaviorStrings} labelledBy={"lebel"}/>
                            <MultiSelect className="multiselect" options={organizationArray} value={selectedOrganizations} onChange={setSelectedOrganizations} hasSelectAll={false} overrideStrings={organizationStrings} labelledBy={"label"}/>
                            <input className="seImageInput" accept="image/*" type="file" id="seImages" multiple/>
                        </div>
                        <div className="bottom">
                            <h2>Encounter Notes</h2>
                            <textarea className= "text"name="encounterNotes" id="" onChange={(event) => setNotes(event.target.value)}></textarea>
                            <button className="seSubmitButton"onClick={((event) => handleSubmit(event))}>Submit</button>
                        </div>
                    </form>
                    <div className="seError">
                        {displayError &&
                        <>
                        <h2>{error}</h2>
                        </>}
                    </div>
                </div>

                <div className="success">
                    {showSuccess &&
                    <>
                    <h2>{success}</h2>
                    </>}
                </div>
                
            </div>
        </div>
    )
}
export default SingleEncounterUpload