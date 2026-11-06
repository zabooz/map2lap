import type {ReactNode} from "react";
import styles from "./Seg.module.css";

/** One of a few choices in a row, as "Route | Area". */
export function Seg<T extends string>({choices, value, onChoose}: {choices: readonly (readonly [T, ReactNode])[]; value: T;
                                                                   onChoose: (choice: T) => void}) {
  return (
    <div className={styles.seg}>
      {choices.map(([choice, text]) => (
        <button key={choice} className={value === choice ? styles.on : ""} onClick={() => onChoose(choice)}>{text}</button>
      ))}
    </div>
  );
}
