import { useState, useEffect } from "react";

export default function Author({ onBack }) {
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/authors/1", {
            credentials: "include"
        })
            .then(res => {
                if (res.status === 401) {
                    onBack();
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) setAuthor(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [onBack]);

    if (loading) {
        return (
            <div>
                <div className="back-button">
                    <button className="btn-back" onClick={onBack}>← Volver</button>
                </div>
                <div className="author-wrapper" style={{ textAlign: "center" }}>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!author) {
        return (
            <div>
                <div className="back-button">
                    <button className="btn-back" onClick={onBack}>← Volver</button>
                </div>
                <div className="author-wrapper" style={{ textAlign: "center" }}>
                    <p>No se pudo cargar la información del autor</p>
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
            
            <div className="author-wrapper">
                <div className="author-header">
                    <div className="author-avatar">
                        👤
                    </div>
                    <h1>{author.name}</h1>
                </div>
                <div className="author-body">
                    <p>📅 Nacimiento: {author.birth_date ? new Date(author.birth_date).toLocaleDateString() : "No disponible"}</p>
                    <p>📞 Teléfono: {author.phone || "No disponible"}</p>
                    <p>✉️ Email: {author.email || "No disponible"}</p>
                </div>
            </div>
        </div>
    );
}