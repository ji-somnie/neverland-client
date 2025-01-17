import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  NavigationContainer,
  DefaultTheme,
  useNavigation,
  useRoute,
  useNavigationContainerRef,
  RouteProp,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PURPLE, WHITE, BLACK, LIGHTGRAY } from './src/styles/GlobalColor';

// Main
import AuthStack from './src/pages/AuthStack';
import HomeStack from './src/pages/HomeStack';
// Tab
import FeedStack from './src/pages/Group/PuzzleStack';
import WriteStack from './src/pages/Group/WriteStack';
import PuzzleStack from './src/pages/Group/AlbumStack';

import FeedIcon from './src/assets/navbar/Feed.svg';
import WriteIcon from './src/assets/navbar/Write.svg';
import PuzzleIcon from './src/assets/navbar/Puzzle.svg';
import { getAccessToken } from './src/services/storage';
import { RecoilRoot, useRecoilState } from 'recoil';
import { groupState } from './src/recoil/groupState';

const Stack = createNativeStackNavigator();

const GlobalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: WHITE,
  },
};

export type RootStackParams = {
  Auth: any;
  Home: any;
  GroupTab: { groupIdx: number | undefined };
};

function App(): JSX.Element {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const checkLogin = async () => {
    const accessToken = await getAccessToken();
    if (accessToken) setIsLogin(true);
  };
  useEffect(() => {
    checkLogin();
  }, [isLogin]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RecoilRoot>
        <RootStack initialRouteName={isLogin ? 'Home' : 'Auth'} />
      </RecoilRoot>
    </GestureHandlerRootView>
  );
}

const RootStack = ({
  initialRouteName,
}: {
  initialRouteName: keyof RootStackParams;
}) => {
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: initialRouteName }],
      });
    }
  }, [initialRouteName, navigationRef]);
  return (
    <NavigationContainer theme={GlobalTheme} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={() => ({
          headerShown: false,
        })}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Home" component={HomeStack} />
        <Stack.Screen name="GroupTab" component={GroupTab} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export type TabProps = {
  Puzzle: { puzzleIdx?: number | undefined };
  Write: any;
  Album: { albumIdx: number | undefined; albumImage: string };
};

const CustomTab = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View
      style={{
        height: 75,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: WHITE,
        paddingHorizontal: 10,
        borderTopWidth: 0.5,
        borderTopColor: LIGHTGRAY,
      }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          if (route.name === 'Puzzle') {
            if (isFocused)
              navigation.reset({
                routes: [{ name: route.name, params: { id: undefined } }],
              });
            else navigation.navigate(route.name, { id: undefined });
          } else if (route.name === 'Write') {
            navigation.navigate('Puzzle', { screen: 'PuzzleUpload' });
          } else if (route.name === 'Album') {
            if (isFocused)
              navigation.reset({
                routes: [
                  {
                    name: route.name,
                    params: {
                      id: undefined,
                      rep_pic:
                        'https://img.allurekorea.com/allure/2022/07/style_62d0cac69cbce-563x700.jpeg',
                    },
                  },
                ],
              });
            else navigation.navigate(route.name, { id: undefined });
          }
        };
        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={{
              width: '20%',
              height: '100%',
              alignItems: 'center',
              marginTop: 40,
            }}>
            {
              {
                0: <FeedIcon color={isFocused ? PURPLE : BLACK} />,
                1: <WriteIcon color={isFocused ? PURPLE : BLACK} />,
                2: <PuzzleIcon color={isFocused ? PURPLE : BLACK} />,
              }[index]
            }
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const Tab = createBottomTabNavigator<TabProps>();
const GroupTab = (): JSX.Element => {
  const route = useRoute<RouteProp<RootStackParams, 'GroupTab'>>();
  const [groupIdx, setGroupIdx] = useRecoilState(groupState);
  useEffect(() => {
    if (route.params.groupIdx) {
      setGroupIdx(route.params.groupIdx);
    }
  }, []);
  return (
    <Tab.Navigator
      tabBar={props => <CustomTab {...props} />}
      initialRouteName="Puzzle"
      screenOptions={() => ({
        headerShown: false,
      })}>
      <Tab.Screen name={'Puzzle'} component={FeedStack} />
      <Tab.Screen
        name={'Write'}
        component={WriteStack}
        listeners={() => ({
          tabPress: (e: any) => {
            e.preventDefault();
          },
        })}
      />
      <Tab.Screen name={'Album'} component={PuzzleStack} />
    </Tab.Navigator>
  );
};

export default App;
