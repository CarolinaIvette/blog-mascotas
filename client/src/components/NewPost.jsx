import { useState } from "react";

export default function NewPost({ onBack }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit() {
    if (!title.trim()) {
      alert("🌸 Por favor ingresa un título 🌸");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    if (img) formData.append("img", img);

    fetch("http://localhost:8000/posts/new", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        alert("✨ ¡Post creado exitosamente! ✨");
        onBack();
      })
      .catch(err => console.error(err));
  }

  return (
    <div>
      <div className="back-button">
        <button className="btn-back" onClick={onBack}>
          ← Volver al Blog
        </button>
      </div>
      
      <div className="form-wrapper">
        <div className="form-header">
          <h1>✍️ Crear Nuevo Post ✍️</h1>
        </div>
        
        <div className="form-body">
          <div className="form-group">
            <label>📝 Título:</label>
            <input
              type="text"
              placeholder="Escribe un título bonito..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>🖼️ Imagen:</label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Vista previa" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>💬 Contenido:</label>
            <textarea
              placeholder="Cuéntanos sobre tu mascota..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            🐾 Publicar Post 🐾
          </button>
        </div>
      </div>
    </div>
  );
}