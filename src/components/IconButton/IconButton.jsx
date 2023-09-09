import "./IconButton.css";

export default function IconButton({ icon, onClick, tooltip }) {
    return (
        <button className="IconButton" onClick={onClick}>
            <img src={icon} />
            <span className="tooltip">{tooltip}</span>
        </button>
    );
}