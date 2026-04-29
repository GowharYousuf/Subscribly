// app/index.tsx
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/util";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import ListHeading from "../components/listHeading";
import UpcomingSubscriptionCard from "../components/UpcomingSubscriptionCard";
const SafeAreaView = styled(RNSafeAreaView)

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-username">{HOME_USER.name}</Text>
        </View>
        <Image source={icons.add} className="home-add-icons w-10 h-10" />
      </View>
      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
          <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MMM/DD')}</Text>
        </View>
      </View>
      <View>
        <ListHeading title="Upcoming" />
        {UPCOMING_SUBSCRIPTIONS.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {UPCOMING_SUBSCRIPTIONS.map((subscription) => (
              <UpcomingSubscriptionCard
                key={subscription.id}
                data={subscription}
              />
            ))}
          </ScrollView>
        ) : (
          <Text className="mt-4 text-center text-muted-foreground">
            No upcoming subscriptions
          </Text>
        )}
      </View>
      <View>
        <ListHeading title="All Subscriptions" />
      </View>
    </SafeAreaView>

  );
}
