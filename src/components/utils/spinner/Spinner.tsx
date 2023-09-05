import { FunctionComponent } from "react";
import styles from "./Spinner.module.scss";

const Spinner: FunctionComponent = () => {
    return (
        <div className={styles.ldsEllipsis}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
};

export default Spinner;
