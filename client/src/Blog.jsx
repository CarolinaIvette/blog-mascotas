import { useEffect, useState } from "react";

export default function Blog({ onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="main-container">
        <h1 className="main-title">Blog de Mascotas</h1>
        <p style={{ textAlign: "center", color: "#d47d8a" }}>Cargando posts...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1 className="main-title"> Blog de Mascotas </h1>
      
      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#d47d8a" }}>
           No hay posts aún. Crea uno.
        </p>
      ) : (
        <div className="card-grid">
          {posts.map(post => (
            <div 
              key={post.id_post} 
              className="card"
              onClick={() => onSelectPost(post.id_post)}
            >
              {post.img ? (
                <img 
                  src={`http://localhost:8000/assets/${post.img}`} 
                  alt={post.title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x200?text=🐾";
                  }}
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  height: "200px", 
                  background: "#ffe0e7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem"
                }}>
                  🐾
                </div>
              )}
              <div className="card-content">
                <h2>{post.title}</h2>
                <p> {post.date ? post.date.substring(0, 10) : "Fecha no disponible"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}