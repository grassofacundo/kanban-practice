import { FunctionComponent } from "react";
import styles from "./Panel.module.scss";

type thisProps = {};

const PanelSkeleton: FunctionComponent<thisProps> = ({}) => {
    return (
        <div className={`${styles.skeleton} ${styles.panelBody}`}>
            <h3></h3>
            <div className={styles.tasksContainer}></div>
        </div>
    );
};

export default PanelSkeleton;
