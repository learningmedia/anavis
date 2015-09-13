import color from "color";

function getContrastColor(col) {
  return color(col).light() ? "#000" : "#FFF";
}

export default { getContrastColor };
