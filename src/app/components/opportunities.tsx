import { Opportunity } from "../lib/models";
import styles from "../page.module.css";

const ORDERED_STATUSES = [
  "Not started",
  "Prioritized",
  "Contacted",
  "Application submitted",
  "Intro scheduled",
  "Interviews scheduled",
  "Awaiting decision",
  "Closed",
];

export const Opportunities: React.FunctionComponent<{
  opportunitiesByStatus: Record<string, Opportunity[]>;
}> = ({ opportunitiesByStatus }) => {
  console.dir({ opportunitiesByStatus }, { depth: null });
  return (
    <section className={styles.opportunitiesSection}>
      <h2 className={styles.opportunitiesSection__header}>Opportunities</h2>
      <ul className={styles.opporunityStatuses}>
        {ORDERED_STATUSES.map((status) => (
          <li className={styles.opportunityStatusColumn} key={status}>
            <h3 className={styles.opportunityStatusColumn__header}>{status}</h3>
            <ul className={styles.opportunityStatusColumn__stack}>
              {opportunitiesByStatus[status]?.map((opportunity) => {
                const logoUrl =
                  opportunity.type === "Connection"
                    ? "/Generic_friend_style_2.png"
                    : opportunity.logoDomain
                    ? `https://logo.clearbit.com/${opportunity.logoDomain}`
                    : "/Generic_company_style_2.png";
                const logoAlt = opportunity.logoDomain
                  ? `${opportunity.name} logo`
                  : "Generic logo";
                return (
                  <li className={styles.opportunityCard} key={opportunity.id}>
                    <div className={styles.opportunityCard__topRow}>
                      <img
                        src={logoUrl}
                        alt={logoAlt}
                        className={styles.opportunityCard__logo}
                      />
                      <div className={styles.opportunityCard__description}>
                        <div className={styles.opportunityCard__name}>
                          {opportunity.name}
                        </div>
                        <div className={styles.opportunityCard__title}>
                          {opportunity.title}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
};
