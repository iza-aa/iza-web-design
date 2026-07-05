import { OWNER_NAME } from "@/lib/intake-prompt";
import { glassCard } from "@/lib/tokens";
import { useIntakeVisibility } from "@/lib/intake-visibility";
import { useLanguage } from "@/lib/language";

const stepKeys = ["stepGuide.step1", "stepGuide.step2", "stepGuide.step3", "stepGuide.step4"];

export function IntakeStepGuide({ current }: { current: number }) {
  const { closeSession } = useIntakeVisibility();
  const { t } = useLanguage();
  const steps = stepKeys.map((key) => t(key, { name: OWNER_NAME }));
  return (
    <div className={`overflow-hidden rounded-2xl lg:w-64 lg:shrink-0 ${glassCard}`}>
      <div className="flex items-center border-b border-(--glass-border) px-4 py-3">
        <button
          type="button"
          onClick={closeSession}
          aria-label={t("stepGuide.closeAria")}
          className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] transition-transform hover:scale-110"
        >
          <span className="text-[8px] font-bold leading-none text-[#4d0000] opacity-0 group-hover:opacity-100">
            &times;
          </span>
        </button>
      </div>

      <div className="p-6 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{t("stepGuide.title")}</p>
        <ol className="mt-4 flex flex-col gap-4">
          {steps.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-primary text-primary-contrast"
                      : active
                        ? "border border-primary text-primary"
                        : "border border-border-subtle text-secondary"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`text-sm ${active ? "font-medium text-on-surface" : done ? "text-on-surface" : "text-secondary"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
