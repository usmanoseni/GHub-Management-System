
import { Bubbles } from "lucide-react";
import { Link } from "react-router-dom";
import { gymImg } from "../../../assets/asset";

interface FitnessTipsProps {
  maxTips?: number
  singleColumn?: boolean
  viewAllTo?: string
}

const FitnessTips = ({
  maxTips,
  singleColumn = false,
  viewAllTo,
}: FitnessTipsProps) => {
  const tips = [
    {
      id: 1,
      image: gymImg[0],
      title: "Stay Consistent!",
      description:
        "Consistency is key to achieving your fitness goals. Make exercise part of your daily routine.",
      color: "bg-green-500",
    },
    {
      id: 2,
      image: gymImg[5],
      title: "Stay Hydrated!",
      description:
        "Drink water regularly throughout the day to support your body during physical activities.",
      color: "bg-amber-500",
    },
    {
      id: 3,
      image: gymImg[1],
      title: "Get Enough Rest!",
      description:
        "Give your body enough time to recover. Quality sleep and rest are important parts of fitness.",
      color: "bg-blue-500",
    },
    {
      id: 4,
      image: gymImg[2],
      title: "Warm Up Before Exercise!",
      description:
        "Start your workout with gentle movements to prepare your muscles and joints for exercise.",
      color: "bg-purple-500",
    },
  ];
  const visibleTips = maxTips ? tips.slice(0, maxTips) : tips

  return (
    <div className="bg-white p-4 w-full shadow-sm rounded-xl border border-gray-100 flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bubbles size={20} className="text-[#10b981]" />

          <h2 className="text-xl font-montserrat font-semibold text-[#082b3c]">
            Fitness Tips
          </h2>
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="text-xs text-[#10b981] hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      {/* Fitness Tips List */}
      <div className={`grid gap-3 ${singleColumn ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {visibleTips.map((tip) => (
          <div
            key={tip.id}
            className="p-2 flex gap-3 justify-start items-center"
          >
            {/* Image */}
            <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg">
              <img
                src={tip.image}
                alt={tip.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex flex-1 min-w-0 flex-col gap-1">
              <span className="text-sm font-montserrat font-semibold text-[#082b3c]">
                {tip.title}
              </span>

              <p className="text-xs text-gray-700 leading-4">
                {tip.description}
              </p>

              <div
                className={`${tip.color} h-[3px] mt-1 w-16 rounded-2xl`}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FitnessTips;
