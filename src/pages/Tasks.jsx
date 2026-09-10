import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";

function Tasks() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState(() => {
    try {
      const savedTodos = localStorage.getItem("todos");
      return savedTodos ? JSON.parse(savedTodos) : [];
    } catch {
      return [];
    }
  });
  const [showFinished, setshowFinished] = useState(true);

  const saveToLS = (updatedTodos) => {
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  const toggleFinished = () => setshowFinished(!showFinished);

  const handleAdd = () => {
    const updatedTodos = [...todos, { id: uuidv4(), todo, isCompleted: false }];
    setTodos(updatedTodos);
    saveToLS(updatedTodos);
    setTodo("");
  };

  const handleChange = (e) => setTodo(e.target.value);

  const handleEdit = (e, id) => {
    let t = todos.filter((i) => i.id === id);
    setTodo(t[0].todo);
    let newTodos = todos.filter((item) => item.id !== id);
    setTodos(newTodos);
    saveToLS(newTodos);
  };

  const handleDelete = (e, id) => {
    let newTodos = todos.filter((item) => item.id !== id);
    setTodos(newTodos);
    saveToLS(newTodos);
  };

  const handleCheckbox = (e) => {
    let id = e.target.name;
    let index = todos.findIndex((item) => item.id === id);
    let newTodos = [...todos];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodos(newTodos);
    saveToLS(newTodos);
  };

  return (
    <div className="mx-3 md:container md:mx-auto my-6 rounded-2xl p-6 min-h-[75vh] md:w-1/2 bg-[var(--surface)] border border-[var(--border)]">
      <h1 className="font-display font-bold text-xl text-center text-[var(--text)]">
        TuDummmm — manage your daily todos
      </h1>

      <div className="my-5">
        <h2 className="text-lg font-bold mb-3 text-[var(--text)]">Add ToDo</h2>
        <div className="flex">
          <input
            onChange={handleChange}
            value={todo}
            type="text"
            className="px-5 rounded-full py-2 w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] outline-none focus:border-[var(--amber)]"
          />
          <button
            onClick={handleAdd}
            disabled={todo.length === 0}
            className="rounded-full px-5 py-2 text-sm font-bold mx-2 disabled:opacity-40"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}
          >
            SAVE
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-[var(--muted)] text-sm">
        <input onChange={toggleFinished} type="checkbox" checked={showFinished} />
        Show finished
      </label>

      <div className="h-px bg-[var(--border)] my-5 w-[90%] mx-auto"></div>

      <h2 className="text-lg font-bold mb-3 text-[var(--text)]">Your ToDos</h2>
      <div className="todos">
        {todos.length === 0 && (
          <div className="text-[var(--faint)] m-5">No todos to display yet.</div>
        )}
        {todos.map(
          (item) =>
            (showFinished || !item.isCompleted) && (
              <div key={item.id} className="flex justify-between items-center my-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="flex gap-3 flex-1 overflow-hidden items-center">
                  <input name={item.id} onChange={handleCheckbox} type="checkbox" checked={item.isCompleted} />
                  <div className={`${item.isCompleted ? "line-through text-[var(--faint)]" : "text-[var(--text)]"} break-words overflow-hidden`}>
                    {item.todo}
                  </div>
                </div>
                <div className="flex h-full">
                  <button onClick={(e) => handleEdit(e, item.id)} className="rounded-lg p-2 py-1 text-sm mx-1 bg-[var(--raise)] text-[var(--muted)] hover:text-[var(--amber)] transition-colors">
                    <FaEdit />
                  </button>
                  <button onClick={(e) => handleDelete(e, item.id)} className="rounded-lg p-2 py-1 text-sm mx-1 bg-[var(--raise)] text-[var(--muted)] hover:text-[var(--amber-2)] transition-colors">
                    <MdDelete />
                  </button>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default Tasks;
