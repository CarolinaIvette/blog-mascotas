import { useState, useEffect } from "react";
import Blog from "./Blog";
import NewPost from "./components/NewPost";
import Post from "./components/Post";
import Author from "./components/Author";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [page, setPage] = useState("blog");
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    fetch("http://localhost:8000/session", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setPage("blog");
      }
    } catch (err) {
      console.error(err);
    }
  };


  if (page === "post" && selectedPost) {
    return <Post id_post={selectedPost} onBack={() => { setPage("blog"); setSelectedPost(null); }} />;
  }

  if (page === "newpost") {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} onBack={() => setPage("blog")} />;
    }
    return <NewPost onBack={() => setPage("blog")} />;
  }

  if (page === "author") {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} onBack={() => setPage("blog")} />;
    }
    return <Author onBack={() => setPage("blog")} />;
  }

  if (page === "login") {
    return <Login onLogin={handleLogin} onBack={() => setPage("blog")} />;
  }

  return (
    <div>
      <nav>
        <button onClick={() => setPage("blog")}>Inicio</button>
        <button onClick={() => setPage("blog")}>Blog</button>
        <button onClick={() => setPage("newpost")}>Nuevo Post</button>
        <button onClick={() => setPage("author")}>Contacto</button>
        {isAuthenticated ? (
          <>
            <span style={{ margin: "0 10px", color: "#d47d8a" }}>👤 {user?.name}</span>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>Login</button>
        )}
      </nav>
      
      <Blog onSelectPost={(id) => { setSelectedPost(id); setPage("post"); }} />
    </div>
  );
}

export default App;