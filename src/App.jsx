import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Navbar from './components/navbar'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar/>
      <div className="container mx-auto my-5 rounded-xl bg-blue-200 p-5">
        <div className="Add ToDo my-5">
          <h2 className="text-lg font-bold mb-3">Add ToDo</h2>
          <input type="text" className="w-3/4 bg-amber-50"/>
          <button className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-6">ADD</button>
        </div>
          <h2 className="text-lg font-bold mb-3">Your ToDo</h2>
        <div className="todos">
          <div className="todo flex">
            <div className="text"></div>
            <div className="buttons">
              <button className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-1">Edit</button>
              <button className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-1">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
