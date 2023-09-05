import { FunctionComponent, useContext } from "react";
import ThemeContext from "../contexts/ThemeContext";
import styles from "./ThemeChanger.module.scss";

type thisProps = {};

const ThemeChanger: FunctionComponent<thisProps> = () => {
    const themeCtx = useContext(ThemeContext);
    const theme = themeCtx?.theme;
    const toggleTheme = themeCtx?.toggleTheme;

    return (
        <button
            className={`${styles.themeButton} ${
                theme === "dark" ? styles.inverted : ""
            }`}
            onClick={() => {
                if (toggleTheme) toggleTheme();
            }}
        ></button>
    );
};

export default ThemeChanger;
