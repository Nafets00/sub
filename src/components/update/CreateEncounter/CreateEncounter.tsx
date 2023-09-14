import "./CreateEncounter.scss"
import { useState } from "react"
import exifr, { Exifr } from "exifr"
import ElectronLog from "electron-log"
import { AnymatchFn } from "vite"

const{v4: uuidv4} = require('uuid')

const CreateEncounter = () =>{
    
    const [radio, setRadio] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const [showError, setShowError] = useState(false)
    
    const [firstDropDown, setfirstDropDown] = useState("Population")
    const [secondDropDown, setsecondDropDown] = useState("Date of encounter")
    const [thirdDropDown, setthirdDropDown] = useState("User")
    const [fourthDropDown, setfourthDropDown] = useState("Location")
    //Every different encounter from the input images with the pattern[population, date, user, location]
    const differentEncounters: string[][] = []
    //The images for the encounters (images for differentEncounters[n] are in imagesOfEncounters[n])
    const imagesOfEncounters: File[][] = []
    //Array of objects as representation for the csv file
    let csvDicts: string | any[] = []
    let sucCounter = 0
    let counterForImages = 0

    const setUserDetails = async(loggedUser: any, usr: any) => {

        const token = localStorage.getItem("Atoken")
        
        if(loggedUser === "true"){
            try{
            const getUsr = await fetch(`https://devel.whalee.io/api/profile/profile`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`},
            })
            const data = await getUsr.json()
            return([data.email, data.firstName, data.id, data.informUser, data.lastName, data.userImage, data.username])
            }
            catch(err)
            {
                throw new Error(`user profile could not be retrieved: ${err}`)
            }
        }
        else{
            const getUsr = await fetch(`https://devel.whalee.io/api/UserManagement/userDtos`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`},
            
            })
            const data = await getUsr.json()
            for(let i = 0; i<data.length; i++)
            {
                let firstLastName = data[i].firstName.concat(data[i].lastName)
                let first_LastName = (data[i].firstName.concat(" ")).concat(data[i].lastName)
                let fLastName = (data[i].firstName.charAt(0)).concat(data[i].lastName)
                let f_LastName = ((data[i].firstName.charAt(0)).concat(" ")).concat(data[i].lastName)
        
                if((firstLastName === usr) || (first_LastName || usr) || (fLastName === usr) || (f_LastName === usr))
                {
                    return([data[i].email, data[i].firstName, data[i].id, data[i].informUser, data[i].lastName, data[i].userImage, data[i].username])
                }
            }
            throw new Error(`no user with the name: ${usr}`)
        
        }
        
        
    }

    const getPopulationID = async (population: string) => {
        const token = localStorage.getItem("Atoken")
        try{
        const getPop = await fetch(`https://devel.whalee.io/api/Population`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`}
        })
        
        const data = await getPop.json()
        for(let i = 0; i<data.length; i++)
        {
            const dname = data[i].displayName
            const abb = data[i].abbreviation
            if(population === dname || population === abb)
            {
                return data[i].id
            }
        }
        throw new Error(`could not find population with name: ${population}`)
        }
        catch(err)
        {
            throw err
        }
    }

    const getLatLon = async (date: any, location:string, populationID: any, index: any, usr: any, csv: any) => {
        let userDetails
        try{
        userDetails = await setUserDetails(radio, usr)
        }
        catch(err)
        {
            throw err
        }
        let email: any
        let firstName: any
        let id: any
        let informUser: any
        let lastName: any
        let userImage: any
        let username: any
        if(userDetails != null)
        {
            email = userDetails[0]
            firstName = userDetails[1]
            id = userDetails[2]
            informUser = userDetails[3]
            lastName = userDetails[4]
            userImage = userDetails[5]
            username = userDetails[6]
        }
        else{throw new Error("user details could not be fetched")}

        var solution: any[] = []
        var year: string =""
        var month: string ="" 
        var day: string =""
        var dayWithoutLeadingZero: string
        var monthWithoutLeadingZero: string
        var tmp: string = ""
        var dateArr = []
        for(let i = 0; i<=date.length; i++)
        {
            var c = ''
            if(i<date.length)
            {
                c = date[i] 
            }
            if(c>='0' && c<='9')
            {
                tmp = tmp.concat(c)
            }
            else{
                if(tmp.length>2)
                {
                    year = tmp
                    dateArr.push(year)
                    tmp = ""
                }
                else if(dateArr.length===1)
                {
                    month = tmp
                    if(month[0] === '0')
                    {
                        monthWithoutLeadingZero = month[1]
                    }
                    dateArr.push(month)
                    tmp = ""
                }
                else{
                    day = tmp
                    if(day[0]=== '0')
                    {
                        dayWithoutLeadingZero = day[1]
                    }
                    dateArr.push(day)
                    tmp = ""
                }
            }
        }
        
        
        if(csvDicts.length === 0)
        {
            let output
            let array2d: string[][]= [[]]
            let reader = new FileReader()
            reader.readAsText(csv[0])
            reader.onload = function(){
                output = reader.result as string
                let tempStr = ""
                if(output === null){
                    throw new Error("csv is null")
                }
                else{
                    
                for(let i = 0; i<output.length; i++)
                {
                    if(output[i]=== ';')
                    {
                        array2d[array2d.length-1].push(tempStr)
                        tempStr = ""
                    }
                    else if(output[i]==='\n')
                    {   
                        array2d[array2d.length-1].push(tempStr)
                        array2d.push([])    
                        tempStr = ""
                    }
                    else{
                        tempStr = tempStr.concat(output[i])  
                    }
                }
                let dicts: object[] = []
                for(let i = 1; i<array2d.length; i++)
                {
                    let dict: {[key: string]: any} = {}
                    for(let j = 0; j<array2d[i].length; j++)
                    {
                        let lowerKey = array2d[0][j]
                        let key = lowerKey.toUpperCase()
                        let val = array2d[i][j]
                        dict[key] = val 
                    }
                    dicts.push(dict)
                    
                }
                csvDicts = dicts
                for(let i = 0; i<dicts.length; i++)
                {
                    let currDic: {[index: string]:any} = dicts[i]
                    if((currDic["DAY"]===day || currDic["DAY"]===dayWithoutLeadingZero) && (currDic["MONTH"]===month || currDic["MONTH"] === monthWithoutLeadingZero) && currDic["YEAR"]===year && currDic["LOCATION"] ===location)
                    {
                        solution.push([currDic["LAT DEG"], currDic["LON DEG"]])
                    }
                }
                if(solution.length===1)
                {
                    upload(location, solution[0][0], solution[0][1], date, populationID, id, firstName, lastName, email, username, informUser, index)
                }
                else{
                    throw new Error(`No or more than one pair of coordinates found for given date: ${day}-${month}-${year} and location: ${location}, please note, that the labels in your csv file have to be: DAY, MONTH, YEAR, LOCATION, LAT DEG and LON DEG`)
                }
                
            }
        }
        }
        else{
            for(let i = 0; i<csvDicts.length; i++)
            {
                let currDic = csvDicts[i]
                if(currDic["DAY"]===day && currDic["MONTH"]===month && currDic["YEAR"]===year && currDic["LOCATION"] ===location)
                {
                    solution.push([currDic["LAT DEG"], currDic["LON DEG"]])
                }
            }
            if(solution.length===1)
            {   
                upload(location, solution[0][0], solution[0][1], date, populationID, id, firstName, lastName, email, username, informUser, index)
            }
            else{
                throw new Error(`No or more than one pair of coordinates found for given date: ${day}-${month}-${year} and location: ${location}, please note, that the labels in your csv file have to be: DAY, MONTH, YEAR, LOCATION, LAT DEG and LON DEG`)
            }
        }
             
    } 
    
    const upload = async (locationName: any, lat: any, lon: any, date: any, populationID: any, id: any, firstName: any, lastName: any, email: any, username: any, informUser: any, index: any) => {
        const token = localStorage.getItem("Atoken")
        try{
        const response = await fetch(`https://devel.whalee.io/api/encounter`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`},
            body: JSON.stringify( 
                {"name": "",
                "description": "", 
                "location": {  
                "name": locationName,
                "latitude": lat,
                "longitude": lon
                }, 
                "dateTime": date,
                "organizationIds": [],
                "populationId": populationID,
                "predationEvent": false,
                "predationTargets": [],
                "submissionUser": {
                  "id": id,
                  "firstName": firstName,
                  "lastName": lastName,
                  "email": email,
                  "username": username,
                  "informUser": informUser},
                "informNewUser": false}
                )
        })
        const data = await response.json()
        if(data.successful === true)
        {
          uploadImages(data.id, populationID, index)  
        }
        else{
            throw new Error(`error in Encountercreation: ${data.errorMessages} variables: name:${locationName} , latitude:${lat} , longitude:${lon} , dateTime:${date} , populationID:${populationID} , id:${id} , firstName:${firstName} , lastName:${lastName} , email:${email} , username:${username} , informUser:${informUser} `)
        }
        }
        catch(err)
        {
            throw err
        }
    }
    //handle encounter creation
    const uploadEncounter = async (index: any, csv: any) => {
        const enc = differentEncounters[index]
        const pop = enc[0]
        const date = enc[1]
        const usr = enc[2]
        const loc = enc[3]
        try{
            getPopulationID(pop).then((response) => getLatLon(date, loc, response, index, usr, csv))
        }
        catch(err)
        {
            ElectronLog.error(err)
        }
    }
    //handle upload of pictures
    const uploadImages = async (encounterID: any, populationID: any, index: any,) => {
        const images = imagesOfEncounters[index]
        const token = localStorage.getItem("Atoken")
        
        
        for(let i = 0; i<images.length; i++)
        {  
            try{
            const formData = new FormData()
            formData.append("file", images[i], images[i].name)
            const response = await fetch(`https://devel.whalee.io/api/file/upload/${populationID}/${encounterID}`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${token}`},
            body: formData})
            if(response.ok === true)
            {
                ElectronLog.info(`successfully uploaded image: ${images[i].path}`)
                sucCounter = sucCounter + 1
                setError(`Trying to upload ${counterForImages} images... \n ${sucCounter} images successfully uploaded`)
            }
            else{
                throw new Error(`${images[i].path} error in image upload: ${response.statusText}`)
            }
            }
            catch(err)
            {
                throw err
            }
            
        }
        setSuccess(`Done: ${sucCounter} of ${counterForImages} images successfully uploaded. Please check the log files if an upload failed`)
    }
    
    //splits name of the images into the given pattern and sorts them into encounters
    function splitImages(image:File){
        var vars = []
        var str = ""
        for(let i = 0; i<image.name.length; i++)
        {
            if(image.name[i]==='_')
            {
                vars.push(str)
                str=""
            }
            else{
                str = str.concat(image.name[i])
            }
        }

        if(vars.length === 4)
        {
            sortImages(vars, image);
        }
        else{
            ElectronLog.error(`${image.name} has wrong naming structure`)
        }
        
        
    }
    function sortImages(vars:string[], image:File){
        var Population = ""
        var DateOfEncounter = ""
        var User = ""
        var Location = ""
        switch(firstDropDown){
            case "Population":Population = vars[0];break;
            case "Date of encounter": DateOfEncounter = vars[0];break;
            case "User": User = vars[0];break;
            case "Location": Location = vars[0];break;
        }

        switch(secondDropDown){
            case "Population":Population = vars[1];break;
            case "Date of encounter": DateOfEncounter = vars[1];break;
            case "User": User = vars[1];break;
            case "Location": Location = vars[1];break;
        }

        switch(thirdDropDown){
            case "Population":Population = vars[2];break;
            case "Date of encounter": DateOfEncounter = vars[2];break;
            case "User": User = vars[2];break;
            case "Location": Location = vars[2];break;
        }

        switch(fourthDropDown){
            case "Population":Population = vars[3];break;
            case "Date of encounter": DateOfEncounter = vars[3];break;
            case "User": User = vars[3];break;
            case "Location": Location = vars[3];break;
        }
        var encounterInformation = [Population, DateOfEncounter, User, Location]
        containsEncounter(encounterInformation, image)
        
    }
    //check if a new Encounter needs to be created
    function containsEncounter(array: string[], image:File){
        for(let i = 0; i<differentEncounters.length; i++){
            if(differentEncounters[i][0]===array[0] && differentEncounters[i][1] ===array[1] && differentEncounters[i][2] === array[2] && differentEncounters[i][3]===array[3]){
                
                imagesOfEncounters[i].push(image)
                return true;
            }
        }
        differentEncounters.push(array)
        ElectronLog.info(`new encounter with population: ${array[0]}, date of encounter: ${array[1]}, user: ${array[2]} and location: ${array[3]}`)
        imagesOfEncounters.push([])
        imagesOfEncounters[imagesOfEncounters.length-1].push(image)
        return false;
    }
    //check if all input fields have been filled
    function checkForValidity(images: any, csv: any){
        const distinct = (value:any, index:any, self:any) => {
            return self.indexOf(value) === index
        }
        const drowdownResults = [firstDropDown, secondDropDown, thirdDropDown, fourthDropDown]
        //check if radio button has a value
        if(radio==""){
            ElectronLog.warn(`Tried to upload images but no radio button was selected`)
            setError("Please choose one of the two options!")
            setShowError(true)
            return false  
        }
        //check, if the values from the dropdown menu are unique, todo: make selected values dissapear in other dropdowns
        else if(!(drowdownResults.filter(distinct).length===4))
        {
            ElectronLog.warn(`Tried to upload images but selected dopdown options were not distinct`)
            setError("Please choose each dropdown option only once!")
            setShowError(true)
            return false
        }
        //check if images have been selected
        else if(images.length === 0)
        {
            ElectronLog.warn(`Tried to upload images but no folder was selected`)
            setError("There are no files in your upload!")
            setShowError(true)
            return false
        }
        //check if a csv file was chosen
        else if(csv.length === 0)
        {
            ElectronLog.warn(`Tried to upload images but no csv file was selected`)
            setError("Please provide a CSV file!")
            setShowError(true)
            return false
        }
        return true   
    }



    //events after pressing submit button
    async function handleSubmit()
    {
        var images = (document.getElementById("images") as HTMLInputElement).files
        var csv = (document.getElementById("csv") as HTMLInputElement).files
        if(checkForValidity(images, csv) && images !=null)
        {
            for(let i= 0; i<images.length; i++)
            { 
                    try{
                        let metadata = await exifr.parse(images[i])
                        counterForImages++
                        ElectronLog.info(`${images[i].path} queued for upload`)
                        splitImages(images[i])
                    }
                    catch(err)
                    {
                        ElectronLog.error(`${err} : ${images[i].path} is not an image`)
                    }
                    
                    
            
            }
        for(let i = 0; i<differentEncounters.length; i++)
        {
            uploadEncounter(i, csv)
        }
        

        //removes the current display
        setShowSuccess(true)
        let dis = document.getElementById("display")
        if(dis != null){
            dis.remove()
        }
        
        
        
        }
        
    }
    return(
        <div className="plate">
            <div className='display' id="display">
                <div className="selectFolder" id="selection">
                    <h2 className="h">Please select a folder</h2>
                    {/* @ts-expect-error */}
                    <input className="in" id='images' accept="image/jpg, image/png" type="file" directory="" webkitdirectory=""/>
                    <h2 className="h">Please select a csv file linking locations to coordinates</h2>
                    <input className="csv" id='csv' accept=".csv" type="file"/>
                    <button className="sub" onClick={handleSubmit}>submit</button>
                </div>
                <div className="userSelection">
                    <form>
                        <label>
                            <input className="rad" type="radio" name="radio" onChange={(event) => setRadio(event.target.value)} value={"false"}/>
                            <span>Select user for upload via naming of pictures</span>
                        </label>
                        <label >
                            <input className="rad" type="radio" name="radio" onChange={(event) => setRadio(event.target.value)} value={"true"}/>
                            <span>Use logged user to upload</span>
                        </label>
                    </form>
                </div>
                <div className="fileStructureInformation">
                    <h2 className="h">Please enter the naming structure of your pictures</h2>
                    <select className="dropdown" name="first point" id="first" onChange={(event) => setfirstDropDown(event.target.value)}>
                        <option value="Population">Population</option>
                        <option value="Date of encounter">Date of encounter</option>
                        <option value="User">User</option>
                        <option value="Location">Location</option>
                    </select>

                    <select className="dropdown" name="second point" id="second" onChange={(event) => setsecondDropDown(event.target.value)}>
                        <option value="Date of encounter">Date of encounter</option>
                        <option value="User">User</option>
                        <option value="Location">Location</option>
                        <option value="Population">Population</option>
                    </select>

                    <select className="dropdown" name="third point" id="third" onChange={(event) => setthirdDropDown(event.target.value)}>
                        <option value="User">User</option>
                        <option value="Location">Location</option>
                        <option value="Population">Population</option>
                        <option value="Date of encounter">Date of encounter</option>
                    </select>

                    <select className="dropdown" name="fourth point" id="fourth" onChange={(event) => setfourthDropDown(event.target.value)}>
                        <option value="Location">Location</option>
                        <option value="Population">Population</option>
                        <option value="Date of encounter">Date of encounter</option>
                        <option value="User">User</option>
                    </select>
                    
                </div>
            </div>
            <div className="error">
                {showError &&
                <>
                <h2>{error}</h2>
                </>}
            </div>
            <div className="success">
                {showSuccess &&
                <>
                <h2>{success}</h2>
                </>}
            </div>
        </div>
    )


}
export default CreateEncounter