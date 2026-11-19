
import { Calendar, Clock, Heart, ArrowRight } from "lucide-react";
import {  nutrition  } from "../../../assets/asset";

const NutritionTips = ({  }) => {
  const nutritionTips = [
    {
      id: 1,
      image:  nutrition.protein,
      title: "The Power of Protein",
      description:
        "Protein helps build and repair muscles. Include different protein sources such as eggs, fish, beans and chicken in your meals.",
      date: "Nov 18, 2026",
      readTime: "5 min read",
    },
    {
      id: 2,
      image:  nutrition.vegetable,
      title: "Eat More Vegetables",
      description:
        "Vegetables provide essential vitamins, minerals and fibre that support your overall health and wellbeing.",
      date: "Nov 17, 2026",
      readTime: "4 min read",
    },
    {
      id: 3,
      image:  nutrition.water,
      title: "Stay Hydrated",
      description:
        "Drink water regularly throughout the day. Remember to replace fluids lost during physical activities.",
      date: "Nov 16, 2026",
      readTime: "3 min read",
    },
    {
      id: 4,
      image:  nutrition.crabs,
      title: "Choose Healthy Carbs",
      description:
        "Foods such as oats, brown rice, potatoes and whole grains provide energy and fibre for your daily activities.",
      date: "Nov 15, 2026",
      readTime: "4 min read",
    },
  ];

  return (
    <div className="rounded-xl shadow p-3 bg-white">

      {/* Header */}
      <div className="py-2 px-3 text-xl font-montserrat font-semibold flex justify-start gap-2 text-[#082b3c]">
        <span className="text-green-500">
          <Heart size={28} fill="currentColor" />
        </span>

        Latest Nutrition Tips
      </div>

      {/* Nutrition Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {nutritionTips.map((tip) => (
          <div
            key={tip.id}
            className="flex flex-col justify-center items-center min-w-0"
          >
            {/* Article Image */}
            <div className="w-full h-28 rounded-2xl overflow-hidden bg-amber-100">
              <img
                src={tip.image}
                alt={tip.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Article Content */}
            <div className="p-2 space-y-2 w-full">

              <h3 className="font-montserrat font-semibold text-[#082b3c]">
                {tip.title}
              </h3>

              <p className="text-sm line-clamp-2 text-gray-800">
                {tip.description}
              </p>

              {/* Date, Reading Time and Button */}
              <div className="flex flex-wrap justify-between items-center gap-2 w-full">

                <div className="flex justify-start items-center min-w-0">

                  <div className="flex items-center gap-1 text-[11px] px-1 text-gray-800">
                    <Calendar size={12} />
                    <span>{tip.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-gray-800 border-l border-gray-400 px-2">
                    <Clock size={12} />
                    <span className="whitespace-nowrap">
                      {tip.readTime}
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                //   onClick={() => onReadMore?.(tip)}
                  className="border border-green-500 px-3 py-1 flex gap-1 justify-center items-center text-green-500 cursor-pointer text-xs rounded-md hover:bg-green-500 transition-colors duration-200 ease-in-out hover:text-white"
                >
                  Read More
                  <ArrowRight size={15} />
                </button>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default NutritionTips;
