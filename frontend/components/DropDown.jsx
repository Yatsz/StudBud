import React from "react"
import { ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const data = [
  {
    label: "Math",
    items: [
      {
        label: "HW 1",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
      {
        label: "HW 2",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
      {
        label: "HW 3",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
    ],
  },
  {
    label: "Chemistry",
    items: [
      {
        label: "Assignment #1",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
      {
        label: "Assignment #2",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
      {
        label: "Assignment #3",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
    ],
  },
  {
    label: "English",
    items: [
      {
        label: "Assignment",
        items: [
          { label: "Question #1" },
          { label: "Question #2" },
          { label: "Question #3" },
        ],
      },
    ],
  },
]

export default function Component({ selections, setSelections }) {
  const handleSelect = (value, index) => {
    const newSelections = [...selections]
    newSelections[index] = value
    // Clear subsequent selections
    for (let i = index + 1; i < newSelections.length; i++) {
      newSelections[i] = ''
    }
    setSelections(newSelections)
  }

  const renderDropdowns = () => {
    const levels = ['course', 'assignment', 'question']
    
    return levels.map((level, i) => {
      const placeholder = `Select ${level}`
      let currentItems = data
      
      if (i > 0 && selections[i-1]) {
        currentItems = currentItems.find(item => item.label === selections[0])?.items || []
      }
      if (i > 1 && selections[i-1]) {
        currentItems = currentItems.find(item => item.label === selections[1])?.items || []
      }
      
      return (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="mx-2 h-4 w-4" />}
          <Select 
            value={selections[i]} 
            onValueChange={(value) => handleSelect(value, i)}
            disabled={i > 0 && !selections[i-1]}
          >
            <SelectTrigger 
              className="w-[200px] rounded-full bg-[#F7F5ED] hover:bg-[#FCEFB7] transition-colors focus:bg-[#FCEFB7] shadow-md focus:shadow-lg outline-none border-none"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-[10px] bg-[#F7F5ED]">
              {currentItems.map((item, index) => (
                <SelectItem 
                  key={index} 
                  value={item.label}
                  className="rounded-[10px] focus:bg-[#FCEFB7] hover:bg-[#FCEFB7]"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </React.Fragment>
      )
    })
  }

  return (
    <div className="flex items-center space-x-2 bg-background">
      {renderDropdowns()}
    </div>
  )
}