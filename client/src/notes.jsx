import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const NotesTable = (props) => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const history = useHistory();

  useEffect(() => {}, []);

  const headers = {
    Authorization: `Bearer ${
      props?.location?.state?.token || localStorage.getItem("token")
    }`,
  };

  const fetchNotes = async () => {
    const res = await axios.get("http://localhost:5001/notes", { headers });
    setNotes(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingNoteId) {
      await axios.put(`http://localhost:5001/notes/${editingNoteId}`, form, {
        headers,
      });
      setEditingNoteId(null);
    } else {
      await axios.post("http://localhost:5001/notes", form, { headers });
    }
    setForm({ title: "", description: "" });
    fetchNotes();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/notes/${id}`, { headers });
    fetchNotes();
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, description: note.description });
    setEditingNoteId(note.id);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleLogout = () => {
    history.push("/login");
    localStorage.removeItem("token");
    setNotes([]);
    setForm({ title: "", description: "" });
    setEditingNoteId(null);
  };

  return (
    <div>
      <h3>
        {editingNoteId ? "Edit Note" : "Add Note"}{" "}
        <button onClick={handleLogout}>logout</button>
      </h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          required
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />{" "}
        <input
          placeholder="Description"
          value={form.description}
          required
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />{" "}
        <button type="submit">{editingNoteId ? "Update" : "Add"}</button>
      </form>

      <h3>Notes List</h3>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.description}</td>
              <td>
                <button onClick={() => handleEdit(n)}>Edit</button>{" "}
                <button onClick={() => handleDelete(n.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {notes.length === 0 && (
            <tr>
              <td colSpan={3}>No notes found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default NotesTable;
