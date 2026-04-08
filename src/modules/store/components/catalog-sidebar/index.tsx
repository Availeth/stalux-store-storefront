const catalogCategories = [
  "AC Drives",
  "Servo Drives",
  "PLCs & HMIs",
  "Sensors",
  "Power Supplies",
  "Cables & Connectivity",
]

const engineeringFocus = [
  "24V DC",
  "230V AC",
  "480V AC",
  "IP20",
  "IP65",
  "IP67",
]

const availabilitySignals = [
  "In-stock products prioritized",
  "Fast-moving SKUs replenished weekly",
]

export default function CatalogSidebar() {
  return (
    <aside className="h-fit border border-[#dbe0e8] bg-white p-5 small:sticky small:top-[10.5rem]">
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6f7f95]">
          Product Categories
        </h2>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-[#9ba8b9]">
          Industrial Automation
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {catalogCategories.map((category, index) => {
          const isActive = index === 0

          return (
            <li key={category}>
              <span
                className={[
                  "flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  isActive
                    ? "bg-[#f7e8ec] text-[#a51634]"
                    : "text-[#4f5e74] hover:bg-[#f4f6fa]",
                ].join(" ")}
              >
                {category}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 border-t border-[#e1e5ec] pt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a97a9]">
          Engineering Focus
        </h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {engineeringFocus.map((tag) => (
            <li
              key={tag}
              className="bg-[#eef2f7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5f6f86]"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 border-t border-[#e1e5ec] pt-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a97a9]">
          Availability
        </h3>
        <ul className="mt-4 space-y-2 text-xs font-medium text-[#5f6f86]">
          {availabilitySignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
