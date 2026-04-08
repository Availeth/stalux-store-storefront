import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-2.5">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5b4040]">
        {title}
      </span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              type="button"
              className={clx(
                "min-h-10 min-w-[120px] rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                {
                  "border-[#c41e3a] bg-[#c41e3a] text-white": v === current,
                  "border-[#d0d4d8] bg-[#f3f3f6] text-[#3f4348] hover:border-[#c41e3a] hover:text-[#9e0027]":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
