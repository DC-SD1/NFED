import { Card, CardContent } from '@cf/ui'
import React from 'react'

interface StatItem {
    title: string;
    value: string;
    info?: string;
    icon: React.ComponentType<any>;
    bgColor: string;
    iconColor: string;
}

const FulfilmentCard = ({ statsData }: { statsData: StatItem[] }) => {
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
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`rounded-lg p-2 ${stat.bgColor} ${stat.iconColor}`}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-900">
                                            {stat.title}
                                        </span>
                                    </div>

                                </div>

                                {/* Value + badge */}
                                <div className="flex flex-col items-start gap-0 pt-2">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {stat.value}
                                    </h3>
                                    {stat.info && (
                                        <p className="bg-gray-200 mt-1 rounded-sm px-2 py-.5 text-xs text-gray-700">
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

export default FulfilmentCard