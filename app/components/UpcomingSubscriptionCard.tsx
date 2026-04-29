import { formatCurrency } from '@/lib/util'
import React from 'react'
import { Image, Text, View } from 'react-native'

export default function UpcomingSubscriptionCard({
  data: { name, price, currency, daysLeft, icon }
}: UpcomingSubscriptionCardProps) {
  return (
    <View className='upcoming-card'>
        <View className='upcoming-row'>
            <Image source={icon} className='upcoming-icon'/>      
        </View>
         <View className='upcoming-row'>
            <Text className="upcoming-price">{formatCurrency(price,currency)}</Text>     
            <Text className="upcoming-meta" numberOfLines={1}>
                {daysLeft > 1 ? `${daysLeft} days left` : 'Last day'}
            </Text> 
        </View>
        <Text className='upcoming-name' numberOfLines={1}>{name}</Text>
    </View>
  )
}
