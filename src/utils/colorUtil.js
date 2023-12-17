export const colorUtil = (key, index) => {
  const normalColor = 'hsl(150, 52%, 51%)'; // Fixed color for 'Normal'

  if (key === 'Normal') {
    return normalColor;
  } else {
    let hue = index * 137.508; // Unique hue for each index

    // Broaden the range to exclude more greens
    const greenHueRange = { start: 80, end: 160 };
    const adjustedHue = hue % 360;
    if (adjustedHue > greenHueRange.start && adjustedHue < greenHueRange.end) {
      hue += greenHueRange.end - greenHueRange.start; // Skip the green range entirely
    }

    const saturation = 60 + (index % 4) * 10; // Vary more for saturation
    let lightness = 35 + (index % 5) * 12; // More variation for lightness

    // Adjust lightness to avoid pastel green
    if (lightness > 70 && lightness < 90) {
      lightness = lightness - 30;
    }

    return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
  }
};

export const generateColor = (index) => {
  const hue = index * 137.508; // Unique hue for each index
  const saturation = 60 + (index % 4) * 10; // Vary more for saturation
  const lightness = 35 + (index % 5) * 12; // More variation for lightness
  return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
};
