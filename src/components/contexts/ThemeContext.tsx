import { FunctionComponent, ReactNode, createContext, useState } from "react";

type thisProps = {
    children: ReactNode;
};
type Theme = "light" | "dark";
interface ThemeContextInterface {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextInterface | null>(null);

export const ThemeProvider: FunctionComponent<thisProps> = ({ children }) => {
    /*
    Theme change code start
    */
    const [theme, setTheme] = useState<Theme>(getBrowserTheme());

    function getBrowserTheme(): Theme {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
            return "dark";
        } else {
            return "light";
        }
    }

    function getOppositeTheme(): Theme {
        return theme === "light" ? "dark" : "light";
    }

    function toggleTheme(): void {
        const root = document.querySelector("#root") as HTMLElement;
        if (!root) return;

        const cssVars = [
            "bgColor",
            "primaryColor",
            "secondaryColor",
            "textColor",
            "accentColor",
        ];
        const newTheme = getOppositeTheme();

        cssVars.forEach((cssVar) => {
            root.style.setProperty(
                `--${cssVar}`,
                `var(--${cssVar}-${newTheme})`
            );
        });
        setTheme(newTheme);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
