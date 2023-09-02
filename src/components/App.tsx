import { FunctionComponent } from "react";
import { ContextLoader } from "./contexts/ContextLoader";
import Dashboard from "./dashboard/Dashboard";
import dragAndDropService from "../services/dragAndDropService";

const App: FunctionComponent = () => {
    dragAndDropService.init();

    return (
        <ContextLoader>
            <Dashboard />
        </ContextLoader>
    );
};

export default App;
