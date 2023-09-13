import "./IconButton.css";

export default function IconButton({ icon, onClick, tooltip, style, imgStyle, ...props }) {
    return (
        <button className="IconButton" onClick={onClick} style={style} {...props}>
            <img src={icon} alt="icon-button" style={imgStyle} />
            <span className="tooltip">{tooltip}</span>
        </button>
    );
}