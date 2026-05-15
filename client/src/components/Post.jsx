import { useEffect, useState } from "react";

export default function Post({ id_post, onBack }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + `/posts/${id_post}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id_post]);

  if (loading) {
    return (
      <div>
        <div className="back-button">
          <button className="btn-back" onClick={onBack}>← Volver</button>
        </div>
        <div className="post-wrapper">
          <div className="post-content" style={{ textAlign: "center" }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post || !post.title) {
    return (
      <div>
        <div className="back-button">
          <button className="btn-back" onClick={onBack}>← Volver</button>
        </div>
        <div className="post-wrapper">
          <div className="post-content" style={{ textAlign: "center" }}>
            <p>📝 Post no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="back-button">
        <button className="btn-back" onClick={onBack}>
          ← Volver al Blog
        </button>
      </div>
      
      <div className="post-wrapper">
        <div className="post-header">
          <h1>{post.title}</h1>
          <h2>✍️ Escrito por: {post.author_name || "Carolina Ramírez"}</h2>
        </div>
        
        {post.img && (
          <img 
            className="post-image"
            src={`${import.meta.env.VITE_API_URL}/assets/${post.img}`}
            alt={post.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x400?text=🐾";
            }}
          />
        )}
        
        <div className="post-content">
          <p>{post.text || "Sin contenido"}</p>
          <div className="post-date">
            📅 {post.date ? new Date(post.date).toLocaleDateString() : "Fecha no disponible"}
          </div>
        </div>
      </div>
    </div>
  );
}