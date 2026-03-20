import {Card, CardContent } from '@cf/ui'
import React from 'react'

interface StatItem {
  title: string;
  value: string;
  badge: React.ReactNode | null;
  info?: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  iconColor: string;
}
const StatisticsCard = ({statsData}: {statsData: StatItem[]}) => {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="flex h-full flex-col justify-between p-3">
              <div>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg p-2 ${stat.bgColor} ${stat.iconColor}`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stat.title}
                    </span>
                  </div>

                </div>

                {/* Value + badge */}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  {stat.info && (
                    <p className="flex-end mt-1 text-xs text-gray-500">
                      {stat.info}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  )
}

export default StatisticsCard