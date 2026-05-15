import { useState } from "react";

export default function Login({ onLogin, onBack }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            fetch(import.meta.env.VITE_API_URL + "/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (onLogin) onLogin(data.user);
                onBack();
            } else {
                setError("Usuario o contraseña incorrectos");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="back-button">
                <button className="btn-back" onClick={onBack}>
                    ← Volver al Blog
                </button>
            </div>

            <div className="login-wrapper">
                <div className="login-header">
                    <h1>🔐 Iniciar Sesión</h1>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>👤 Usuario:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>🔒 Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? "Cargando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}