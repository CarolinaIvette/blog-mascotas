import { Link } from "react-router-dom";

export function Card({ title, date, img, id_post }) {
  return (
    <div className="card">
      <Link to={"/blog/" + id_post}>
      <img src={`${import.meta.env.VITE_API_URL}/assets/${img}`} alt="Imagen" />
        <h2>{title}</h2>
        <p>{date ? date.substring(0, 10) : ""}</p>
      </Link>
    </div>
  );
}