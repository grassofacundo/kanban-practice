import { FunctionComponent, ReactNode } from "react";
import { ThemeProvider } from "./ThemeContext";
import { KanbanProvider } from "./KanbanContext";

type thisProps = {
    children: ReactNode;
};

export const ContextLoader: FunctionComponent<thisProps> = ({ children }) => {
    return (
        <KanbanProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </KanbanProvider>
    );
};
