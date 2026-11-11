const SubscriptionStatus = () => {
    const remainingDays= 28
  const isSuspended = remainingDays <= 0;
  const isExpiring = remainingDays <= 10 && remainingDays > 0;

  const containerStyle = isSuspended
    ? "bg-red-100 border-red-300"
    : isExpiring
    ? "bg-yellow-100 border-yellow-300"
    : "bg-green-100 border-green-300";

  const statusStyle = isSuspended
    ? "text-red-600"
    : isExpiring
    ? "text-gray-700"
    : "text-gray-700";

  const statusText = isSuspended
    ? "Suspended"
    : isExpiring
    ? "Expiring Soon"
    : "Active";

  return (
    <div className={`flex justify-between items-center py-2 px-3 mt-3 text-sm rounded-lg border ${containerStyle}`}>

      <div className="font-normal">
        {isSuspended
          ? "Subscription expired"
          : `${remainingDays} days remaining`}
      </div>

      <div className="flex justify-end items-center gap-3">

        <span className={`text-xs  ${statusStyle}`}>
          {statusText}
        </span>

        <button className="bg-green-500 py-1 px-4.5 hover:bg-green-600 rounded-md cursor-pointer text-white">
          Payment
        </button>

      </div>
    </div>
  );
};

export default SubscriptionStatus;