import ListHeading from "@/components/listHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/util";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();

  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const displayName =
    user?.firstName ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    HOME_USER.name.trim();

  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FlatList
        ListHeaderComponent={() => (
          <View className="px-5 pt-5">
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable onPress={() => console.log("Add subscription")}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
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

            <ListHeading title="All Subscriptions" />
          </View>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-5">
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id
                )
              }
            />
          </View>
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions found</Text>
        }
      />
    </SafeAreaView>
  );
}