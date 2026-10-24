import { usStateCode, usStates } from "@lib/util/us-states"
import { ChevronUpDown } from "@medusajs/icons"
import Input from "@modules/common/components/input"
import { ChangeEventHandler } from "react"

type StateSelectProps = {
  name: string
  countryCode: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
  "data-testid"?: string
}

const StateSelect = ({ countryCode, value, ...props }: StateSelectProps) => {
  if (countryCode.toLowerCase() !== "us") {
    return (
      <Input
        {...props}
        label="State / Province"
        autoComplete="address-level1"
        value={value}
      />
    )
  }

  return (
    <div className="relative w-full">
      <label
        htmlFor={props.name}
        className="absolute top-1.5 left-4 text-[10px] text-ui-fg-subtle pointer-events-none"
      >
        State / Province<span className="text-rose-500">*</span>
      </label>
      <select
        {...props}
        id={props.name}
        autoComplete="address-level1"
        required
        value={usStateCode(value)}
        className="pt-4 pb-1 block w-full h-11 pl-4 pr-10 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover txt-compact-medium"
      >
        <option value="" disabled>
          Select a state
        </option>
        {usStates.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
      <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
        <ChevronUpDown />
      </span>
    </div>
  )
}

export default StateSelect
