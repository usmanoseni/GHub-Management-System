
import {
  Lightbulb,
  CheckCircle2,
  Apple,
  Droplets,
  Utensils,
  Leaf,
  ArrowRight,
} from "lucide-react";

const nutritionTips = [
  {
    id: 1,
    icon: Utensils,
    text: "Eat balanced meals containing protein, carbohydrates, and healthy fats.",
  },
  {
    id: 2,
    icon: Apple,
    text: "Include a variety of fruits and vegetables in your daily meals.",
  },
  {
    id: 3,
    icon: Droplets,
    text: "Drink water regularly throughout the day, especially during exercise.",
  },
  {
    id: 4,
    icon: Leaf,
    text: "Choose whole grains and other fibre-rich foods when possible.",
  },
  {
    id: 5,
    icon: CheckCircle2,
    text: "Maintain regular eating habits that support your daily activities.",
  },
];

const QuickNutritionTips = () => {
  return (
    <section className="flex h-full md:max-h-[40rem] min-w-0 flex-col rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex min-w-0 items-center gap-3 sm:mb-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <Lightbulb size={23} className="text-[#10b981]" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight text-[#082b3c] sm:text-lg">
            Quick Nutrition Tips
          </h2>
          <p className="mt-1 text-xs leading-4 text-gray-500">
            Simple habits for a healthier lifestyle
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:gap-4">
        {nutritionTips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div key={tip.id} className="flex min-w-0 items-start gap-2.5 sm:gap-3">
              <Icon
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-[#10b981]"
              />
              <p className="min-w-0 break-words text-[13px] leading-5 text-[#082b3c] sm:text-sm">
                {tip.text}
              </p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-5 flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#082b3c] px-3 py-3 text-center text-xs font-semibold leading-5 text-white transition-colors hover:bg-[#10445b] sm:mt-6 sm:px-4 sm:text-sm"
      >
        <span>Explore Nutrition Guides</span>
        <ArrowRight size={17} className="shrink-0" aria-hidden="true" />
      </button>
    </section>
  );
};

export default QuickNutritionTips;
