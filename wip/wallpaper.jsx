// wallpaper.jsx
// Animated wallpaper

export const command = () => "";
export const refreshFrequency = False;

export const render = () => {
  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  return (
    <div
      ref={(el) => (element = el)}
      style={containerStyle}
    ></div>
  );
};
