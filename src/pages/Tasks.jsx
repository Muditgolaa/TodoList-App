import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useStore, actions } from "../lib/store";

function Tasks() {
  const { todos } = useStore();
  const [todo, setTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showFinished, setshowFinished] = useState(true);

  const handleChange = (e) => setTodo(e.target.value);
  const toggleFinished = () => setshowFinished(!showFinished);

  // Add a new todo, or save an edit if we're in edit mode.
  const handleAdd = (e) => {
    e.preventDefault();
    if (todo.trim().length === 0) return;
    if (editingId) {
      actions.updateTodo(editingId, todo);
      setEditingId(null);
    } else {
      actions.addTodo(todo);
    }
    setTodo("");
  };

  // Load the todo's text back into the box and switch to edit mode.
  const handleEdit = (id) => {
    const t = todos.find((i) => i.id === id);
    if (!t) return;
    setTodo(t.todo);
    setEditingId(id);
  };

  const handleDelete = (id) => {
    actions.deleteTodo(id);
    if (editingId === id) {
      setEditingId(null);
      setTodo("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTodo("");
  };

  return (
    <div className="mx-3 md:container md:mx-auto my-6 rounded-2xl p-6 min-h-[75vh] md:w-1/2 bg-[var(--surface)] border border-[var(--border)]">
      <h1 className="font-display font-bold text-xl text-center text-[var(--text)]">
        TuDummmm — manage your daily todos
      </h1>

      <div className="my-5">
        <h2 className="text-lg font-bold mb-3 text-[var(--text)]">
          {editingId ? "Edit ToDo" : "Add ToDo"}
        </h2>
        <form onSubmit={handleAdd} className="flex">
          <input
            onChange={handleChange}
            value={todo}
            type="text"
            className="px-5 rounded-full py-2 w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] outline-none focus:border-[var(--amber)]"
          />
          <button
            type="submit"
            disabled={todo.length === 0}
            className="rounded-full px-5 py-2 text-sm font-bold mx-2 disabled:opacity-40"
            style={{ background: "linear-gradient(180deg,var(--amber),var(--amber-2))", color: "#1a0f02" }}
          >
            {editingId ? "UPDATE" : "SAVE"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
            >
              Cancel
            </button>
          )}
        </form>
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
                  <input
                    name={item.id}
                    onChange={() => handleCheckboxToggle(item.id)}
                    type="checkbox"
                    checked={item.isCompleted}
                  />
                  <div className={`${item.isCompleted ? "line-through text-[var(--faint)]" : "text-[var(--text)]"} break-words overflow-hidden`}>
                    {item.todo}
                  </div>
                </div>
                <div className="flex h-full">
                  <button onClick={() => handleEdit(item.id)} className="rounded-lg p-2 py-1 text-sm mx-1 bg-[var(--raise)] text-[var(--muted)] hover:text-[var(--amber)] transition-colors">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 py-1 text-sm mx-1 bg-[var(--raise)] text-[var(--muted)] hover:text-[var(--amber-2)] transition-colors">
                    <MdDelete />
                  </button>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );

  function handleCheckboxToggle(id) {
    actions.toggleTodo(id);
  }
}

export default Tasks;