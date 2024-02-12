import styles from "../page.module.css";

export const Tasks: React.FunctionComponent<{ tasks: any[] }> = ({ tasks }) => {
  return (
    <section className={styles.tasksSection}>
      <h2 className={styles.tasksSection__header}>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li className={styles.task} key={task.id}>
            <input className={styles.task__button} type="checkbox" />
            <div className={styles.task__description}>
              {task.properties.Name.title[0].plain_text}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
