const FocusAgriculturalOrderCard = ({
  crop = "Chili pepper",
  cropIcon = "🌶️",
  description = "Extra class chili pepper required",
  startDate = "01 May 2025",
  deliveryDate = "19 Nov 2025",
  cultivationType = "Conventional Non-GMO",
  grade = "Extra class",
  variety = "Legon 18",
  location = "Tagadzi, Volta Region",
  contact = "+233 999 9999",
  regionalManager = "Abena Agyeman",
  plantArea = "1.5 acres (buffer included)",
  seedsNeeded = "6kg Carbon box",
  plantingDate = "1 Aug 2025",
  harvestDate = "30 Oct 2025",
  expectedProfit = "GHS120 000",
}) => {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 font-sans shadow-lg">
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-gray-light flex size-9 items-center justify-center rounded-full">
          <div className="text-sm">{cropIcon}</div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">{crop}</h3>
          <p className="text-gray-dark text-sm">{description}</p>
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="mb-4 grid grid-cols-2 gap-6 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">
            Start date
          </h3>
          <p className="text-gray-dark text-sm">{startDate}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">End date</h3>
          <p className="text-gray-dark text-sm">{deliveryDate}</p>
        </div>
      </div>
      <hr className="border-gray-light border-t-1 mb-4" />

      {/* Details Grid */}
      <div className="mb-4 grid grid-cols-2 gap-6 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">
            Cultivation type
          </h3>
          <p className="text-gray-dark text-sm">{cultivationType}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">Grade</h3>
          <p className="text-gray-dark text-sm">{grade}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold sm:text-base">Variety</h3>
          <p className="text-gray-dark text-sm">{variety}</p>
        </div>
      </div>
      <hr className="border-gray-light border-t-1 mb-4" />
      {/* Fulfillment Center Section */}
      <div className="mb-4">
        <h2 className="mb-4 text-sm font-semibold">
          Fulfillment center details
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">
              Location
            </h3>
            <p className="text-gray-dark text-sm">{location}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">Contact</h3>
            <p className="text-gray-dark text-sm">{contact}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">
              Regional manager
            </h3>
            <p className="text-gray-dark text-sm">{regionalManager}</p>
          </div>
        </div>
      </div>
      {/* Farm Plan Preview */}
      <div className="border-gray-light rounded-lg border p-4">
        <h2 className="text-md mb-4 font-semibold">Farm plan preview</h2>
        <p className="text-gray-dark text-md mb-4 font-thin">
          Based on this order, we recommend:
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="min-w-0 font-medium">•</span>
            <span>
              <span className="font-thin">Plant area:</span> {plantArea}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="min-w-0 font-medium">•</span>
            <span>
              <span className="font-thin">Seeds needed:</span> {seedsNeeded}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="min-w-0 font-medium">•</span>
            <span>
              <span className="font-thin">Planting date:</span> {plantingDate}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="min-w-0 font-medium">•</span>
            <span>
              <span className="font-thin">Harvest date:</span> {harvestDate}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="min-w-0 font-medium">•</span>
            <span>
              <span className="font-thin">Expected profit:</span>{" "}
              {expectedProfit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusAgriculturalOrderCard;
