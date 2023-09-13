import{useCookies} from 'react-cookie'
import './App.scss'
import Auth from '@/components/update/Auth/authentication'
import ToolHeader from './components/update/ToolHeader/ToolHeader'
import FuncBar from './components/update/FuncBar/FuncBar'

function App() {
  const [cookies, setCookie, removeCookie] = useCookies()
  let testToken = localStorage.getItem("Atoken")
  return (
    <div className='App'>
      {testToken && <Auth/>}
      
      {!testToken &&
      <>
        <div>
          <ToolHeader></ToolHeader>
          <FuncBar></FuncBar>
        </div>
      </>
      }


    </div>
  )
}

export default App
