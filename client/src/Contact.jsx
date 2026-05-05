import { useState } from "react";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    alert(`¡Gracias ${nombre}! Tu mensaje ha sido enviado.`);
    setNombre("");
    setEmail("");
    setMensaje("");
  }

  return (
    <div className="page">
      <div className="form-container">
        <h1> Contacto</h1>
        <p style={{ textAlign: "center", marginBottom: "2rem", color: "#666" }}>
          Escríbenos
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mensaje:</label>
            <textarea
              placeholder="Escribe tu mensaje..."
              rows="5"
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
            />
          </div>

          <button className="btn-submit" type="submit">
            ✉️ Enviar Mensaje
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", color: "#666" }}>
          <p> Teléfono: 235 110 42 32</p>
          <p>Email: carito.hola1119@gmail.com</p>
          <p> Ubicación: Puebla</p>
        </div>
      </div>
    </div>
  );
}