import { FunctionComponent } from "react";
import { ContextLoader } from "./contexts/ContextLoader";
import Dashboard from "./dashboard/Dashboard";

const App: FunctionComponent = () => {
    return (
        <ContextLoader>
            <Dashboard />
        </ContextLoader>
    );
};

export default App;
