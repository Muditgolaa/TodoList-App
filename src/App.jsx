import { useState , useEffect} from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import Navbar from "./components/navbar";
import { v4 as uuidv4 } from "uuid";
// ⇨ 'ab16e731-6cee-424d-81a0-5929e9bdb0cc'
function App() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [showFinished, setshowFinished] = useState(true)

  useEffect(()=>{
    let todosString = localStorage.getItem("todos")
    if(todosString){
      let todos = JSON.parse(localStorage.getItem("todos"))
      setTodos(todos)
    } 
  },[])

  const saveToLS = (params) => {
    localStorage.setItem("todos",JSON.stringify(todos)) 
  }

  const toggleFinished = () =>{
    setshowFinished(!showFinished)
  }

  const handleAdd = () => {
    setTodos([...todos, {id:uuidv4(), todo, isCompleted: false }]);
    setTodo("");
    saveToLS()
  };

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  const handleEdit = (e, id) => {
    let t = todos.filter(i=>i.id === id)
    setTodo(t[0].todo)
    let newTodos = todos.filter((item, i) => {
      return item.id !== id;
    })
    setTodos(newTodos)
    saveToLS()

  };

  const handleDelete = (e,id) => {
    let index = todos.findIndex(item=>{
      return item.id === id
    })
    let newTodos = todos.filter((item, i) => {
      return item.id !== id;
    })
    setTodos(newTodos)
    saveToLS()

  };

  const handleCheckbox = (e) => { 
    let id = e.target.name
    let index = todos.findIndex(item=>{
      return item.id === id
    })
    let newTodos = [...todos]
    newTodos[index].isCompleted = !newTodos[index].isCompleted
    setTodos(newTodos)
    saveToLS()

   }

  return (
    <>
      <Navbar />
      <div className="container mx-auto my-5 rounded-xl bg-blue-200 p-5 min-h-[75vh]"> 
        <div className="Add ToDo my-5">
          <h2 className="text-lg font-bold mb-3">Add ToDo</h2>
          <input
            onChange={handleChange}
            value={todo}
            type="text"
            className="w-3/4 bg-amber-50"
          />
          <button
            onClick={handleAdd} disabled={todo.length === 0}
            className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-6"
          >
            SAVE
          </button>
        </div>
        <input onChange={toggleFinished} type="checkbox" checked={showFinished} /> Show Finished
        <h2 className="text-lg font-bold mb-3">Your ToDo</h2>
        <div className="todos">
          {todos.length === 0 && <div className=" text-shadow-white m-5">No ToDos to display</div>}
          {todos.map((item) => {
            return (
              (showFinished || !item.isCompleted) && <div key={item.id} className="todo flex justify-between w-1/3 my-2 ">
                <div className="flex gap-2 flex-1 overflow-hidden">
                <input name={item.id} onChange={handleCheckbox} type="checkbox" checked={item.isCompleted} />
                <div className={`${item.isCompleted ? "line-through" : ""} break-words overflow-hidden`}>
                  {item.todo}
                </div>
                </div>
                <div className="buttons flex h-full">
                  <button
                    onClick={(e) => handleEdit(e,item.id)}
                    className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(e,item.id)}
                    className="bg-blue-700 text-white hover:bg-blue-900 rounded-lg p-2 py-1 text-sm font-bold mx-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default App;
