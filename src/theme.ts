export default {
  fonts: {
    body:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: '"Avenir Next", sans-serif',
    monospace: "Menlo, monospace",
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  letterSpacings: {
    body: "normal",
    heading: 1.6,
  },
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#009bff",
    secondary: "#bfe7ff", // A contrast color for emphasizing UI
    accent: "#922610",
    highlight: "#8AF2FF", // A background color for highlighting text
    muted: "#333",
  },
  text: {
    heading: {
      fontSize: 3,
      fontFamily: "heading",
      fontWeight: "body",
      fontVariant: "small-caps",
      borderBottom: "1px solid black",
      borderBottomColor: "accent",
      paddingTop: 2,
    },
    title: {
      variant: "text.heading",
      fontSize: 5,
      borderBottomWidth: 0,
    },
    subheading: {
      fontSize: 0,
      fontVariant: "normal",
      fontWeight: "body",
      fontStyle: "italic",
      color: "muted",
    },
    inline: {
      display: "inline",
      fontSize: 2,
      fontWeight: "bold",
      fontFamily: "body",
      marginRight: 2,
    },
  },
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
      borderTopWidth: 6,
      borderBottomWidth: 6,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderStyle: "solid",
      borderColor: "goldenrod",
      backgroundColor: "background",
    },
    // compact: {
    //   padding: 1,
    //   borderRadius: 2,
    //   border: "1px solid",
    //   borderColor: "muted",
    // },
  },
};
