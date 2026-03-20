import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cf/ui'
import { IconCalendar } from '@tabler/icons-react'
import React from 'react'

const StatisticsFilter = () => {
  return (
    <div>
      <Select>
        <SelectTrigger className="h-9 w-auto gap-2 rounded-full border-none bg-[#EDF0E6] px-4 text-sm font-medium text-gray-700 hover:bg-[#e5e7eb]">
          <IconCalendar size={16} className="text-gray-500" />
          <SelectValue placeholder="All time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
          <SelectItem value="all-time">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default StatisticsFilter