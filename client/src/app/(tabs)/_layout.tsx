import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Platform } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Home, Calendar as CalendarIcon, Leaf, BookOpen, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = 'light';
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon as={Home} size={24} color={color} />,
        }}
      />
      <Tabs.Screen 
        name='calendar'
        options={{
          title: "Lịch trình",
          tabBarIcon: ({color}) => <Icon as={CalendarIcon} size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <Icon as={Leaf} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Nhật ký',
          tabBarIcon: ({ color }) => <Icon as={BookOpen} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color }) => <Icon as={User} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
