import "./IconButton.css";

export default function IconButton({ icon, onClick, tooltip, style, imgStyle }) {
    return (
        <button className="IconButton" onClick={onClick} style={style}>
            <img src={icon} alt="icon-button" style={imgStyle} />
            <span className="tooltip">{tooltip}</span>
        </button>
    );
}