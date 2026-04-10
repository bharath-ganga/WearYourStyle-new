const commonStyles = {
    // default transition
    default_transition: "all 300ms ease-in-out",
    // font family
    font_family_inter: "'Inter', sans-serif",
};

const lightTheme = {
    ...commonStyles,
    // colors
    color_white: "#fff",
    color_black: "#000",
    color_platinum: "#d9d9d9",
    color_jet: "#333333",
    color_yellow: "#fdc419",
    color_yellow_green: "#7ad005",
    color_sea_green: "#10b9b0",
    color_sea_green_v1: "#14c4b5",
    color_flash_white: "#eef4f4",
    color_anti_flash_white: "#edeef2",
    color_purple: "#a149b6",
    color_red: "#f00",
    color_gray: "#807d7e",
    color_dim_gray: "#6d6d6d",
    color_outerspace: "#3c4242",
    color_silver: "#bebcbd",
    color_whitesmoke: "#f6f6f6",
    color_brown: "#fb9f4c",
    color_black_04: "rgba(0, 0, 0, 0.4)",
};

const darkTheme = {
    ...commonStyles,
    // colors
    color_white: "#1e1e1e",
    color_black: "#fff",
    color_platinum: "#333",
    color_jet: "#eeeeee",
    color_yellow: "#fdc419",
    color_yellow_green: "#7ad005",
    color_sea_green: "#10b9b0",
    color_sea_green_v1: "#14c4b5",
    color_flash_white: "#121212",
    color_anti_flash_white: "#252525",
    color_purple: "#bb86fc",
    color_red: "#cf6679",
    color_gray: "#a0a0a0",
    color_dim_gray: "#cccccc",
    color_outerspace: "#ffffff",
    color_silver: "#444444",
    color_whitesmoke: "#2a2a2a",
    color_brown: "#fb9f4c",
    color_black_04: "rgba(255, 255, 255, 0.1)",
};
  

  // media query
  const breakpoints = {
    xs: "480px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    xxl: "1400px",
  };
  
  const defaultTheme = lightTheme;
export { lightTheme, darkTheme, defaultTheme, breakpoints };
  