import { useState, useEffect, useCallback } from 'react';
import {
  Text,
  ScrollView,
  TextInput,
  SafeAreaView,
  View,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  Image,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import styled from 'styled-components/native';
import CustomHeader from '../common/CustomHeader';
import Input from '../common/Input';
import BottomButton from '../common/BottomButton';
import PhotoButton from '../common/PhotoButton';
import { Asset } from 'react-native-image-picker';
import {
  BLACK,
  GRAY,
  LIGHTPURPLE,
  PURPLE,
  WHITE,
} from '../../styles/GlobalColor';
import { Caption, Label, Title, Content } from '../../styles/GlobalText';
import InfoIcon from '../../assets/common/Info.svg';
import PaintIcon from '../../assets/common/Paint.svg';
import LinkIcon from '../../assets/common/Link.svg';
import CalendarIcon from '../../assets/common/Calendar.svg';
import { FeedStackParams } from '../../pages/Group/FeedStack';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import Postcode from '@actbase/react-daum-postcode';
import IconButton from '../common/IconButton';
import Request from '../../services/requests';
import { groupState } from '../../recoil/groupState';
import { useRecoilState } from 'recoil';

export interface FeedProps {
  title: string;
  date: Date;
  location: string;
  content: string;
  puzzlerList: string[];
}

interface PuzzlerProps {
  nickname: string;
  profileImage: string | null;
  userIdx: number;
}

const { width, height } = Dimensions.get('window');
const FeedUpload = ({
  navigation,
}: StackScreenProps<FeedStackParams, 'FeedUpload'>) => {
  const [groupIdx, setGroupIdx] = useRecoilState(groupState);
  const [feed, setFeed] = useState<FeedProps>({
    title: '',
    date: new Date(),
    location: '',
    content: '',
    puzzlerList: [],
  });
  const [photo, setPhoto] = useState<Asset[]>([
    {
      fileName: '',
      width: 0,
      height: 0,
      uri: '',
    },
  ]);
  const [postModal, setPostModal] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const request = Request();

  const showPicker = useCallback((value: boolean) => setShow(value), []);

  var isDatePicked =
    moment(feed.date).format('YYYY.MM.DD').toString() !==
    moment(new Date()).format('YYYY.MM.DD').toString();

  const handleInputChange = (key: keyof FeedProps, value: any) => {
    setFeed({ ...feed, [key]: value });
  };

  const [puzzlerList, setPuzzlerList] = useState<PuzzlerProps[]>([
    {
      nickname: '',
      profileImage: null,
      userIdx: 0,
    },
  ]);
  const getPuzzler = async () => {
    const response = await request.get(
      `/groups/${groupIdx}/puzzles/puzzlerList`,
    );
    setPuzzlerList(response.result.puzzlerList);
  };

  useEffect(() => {
    getPuzzler();
  }, []);

  const onCreate = async () => {
    if (
      feed.title.length *
        feed.content.length *
        feed.location.length *
        feed.puzzlerList.length ===
      0
    ) {
      Alert.alert('빈칸을 모두 채워주세요!');
    }
    const createPuzzleRequest = new Blob(
      [
        JSON.stringify({
          title: feed.title,
          puzzleDate: feed.date.toISOString().split('T')[0].substring(0, 10),
          content: feed.content,
          location: feed.location,
          puzzlerList: feed.puzzlerList,
        }),
      ],
      { type: 'application/json', lastModified: 2 },
    );
    console.log(JSON.stringify({
      title: feed.title,
      puzzleDate: feed.date.toISOString().split('T')[0].substring(0, 10),
      content: feed.content,
      location: feed.location,
      puzzlerList: feed.puzzlerList,
    }))

    const formData = new FormData();
    formData.append('createPuzzleRequest', createPuzzleRequest);
    formData.append('image', {
      uri: photo[0].uri,
      name: photo[0].fileName,
      type: photo[0].uri!.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
    });
    const response = await request.post(
      `/groups/${groupIdx}/puzzles`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/formdata',
        },
      },
    );
    console.log(response);
    if (response.isSuccess) {
      navigation.goBack();
      navigation.navigate('FeedDetail', { feedIdx: 1 });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
      <CustomHeader
        label="작성하기"
        onClose={() => {
          navigation.goBack();
        }}
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={10}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 25,
            paddingBottom: 20,
          }}>
          <View style={{ alignItems: 'center', paddingVertical: 5 }}>
            <PaintIcon style={{ marginVertical: 20 }} />
            <Title>사진과 함께 추억 퍼즐을 생성해드려요</Title>
            <Content style={{ color: GRAY, textAlign: 'center', fontSize: 12 }}>
              사진이 없으시다면, 내용을 기반으로 AI 화가가 추억 퍼즐을
              그려드려요.
            </Content>
          </View>
          <PhotoBox>
            <PhotoButton photo={photo} setPhoto={setPhoto} />
          </PhotoBox>
          <Input
            label="제목"
            value={feed.title}
            onChangeText={title => handleInputChange('title', title)}
            isRequired
            placeholder="제목을 작성해주세요."
          />
          <View>
            <Input
              value={
                isDatePicked
                  ? moment(feed.date).format('YYYY년 MM월 DD일').toString()
                  : undefined
              }
              placeholder="추억 날짜를 입력해주세요."
              label="날짜"
              isRequired
              editable={false}
            />
            <IconButton
              onPress={() => showPicker(true)}
              style={{
                position: 'absolute',
                top: 27,
                right: 3,
                zIndex: 1,
              }}>
              <CalendarIcon />
            </IconButton>
          </View>
          <TouchableOpacity
            style={{ zIndex: 1 }}
            onPress={() => setPostModal(true)}>
            <Input
              label="장소"
              isRequired
              value={feed.location}
              placeholder="장소를 입력해주세요."
              editable={false}
            />
          </TouchableOpacity>
          <Label>내용 *</Label>
          <TextInput
            value={feed.content}
            onChangeText={content => handleInputChange('content', content)}
            style={{
              borderWidth: 1,
              borderColor: GRAY,
              borderRadius: 2,
              padding: 10,
              marginBottom: 20,
              height: 150,
              color: BLACK,
              fontSize: 14,
              fontFamily: 'Pretendard Variable',
            }}
            multiline
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Label>퍼즐러 * </Label>
            <InfoIcon />
            <Caption style={{ color: GRAY }}>
              {' '}
              함께 추억을 공유할 퍼즐러들을 초대하세요.
            </Caption>
          </View>
          <FlatList
            data={puzzlerList.slice(0,1)}
            scrollEnabled={false}
            keyExtractor={item => item.nickname}
            renderItem={({ item, index }) => {
              const { profileImage, nickname, userIdx } = item;
              const isInvited = feed.puzzlerList.includes(nickname);
              const isLastItem = feed.puzzlerList.length - 1 === index;
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopWidth: 1,
                    borderStartColor: GRAY,
                    borderStartWidth: 1,
                    borderEndWidth: 1,
                    borderEndColor: GRAY,
                    borderColor: GRAY,
                    borderBottomColor: GRAY,
                    borderBottomWidth: isLastItem ? 1 : 0,
                    borderTopLeftRadius: index === 0 ? 2 : 0,
                    borderTopRightRadius: index === 0 ? 2 : 0,
                    borderBottomLeftRadius: isLastItem ? 2 : 0,
                    borderBottomRightRadius: isLastItem ? 2 : 0,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={
                        profileImage
                          ? { uri: profileImage }
                          : require('../../assets/Puzzle.png')
                      }
                      style={{ width: 36, height: 36, borderRadius: 180 }}
                    />
                    <Label style={{ marginLeft: 10 }}>{nickname}</Label>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      isInvited
                        ? handleInputChange(
                            'puzzlerList',
                            feed.puzzlerList.filter(
                              member => member !== nickname,
                            ),
                          )
                        : handleInputChange('puzzlerList', [
                            ...feed.puzzlerList,
                            nickname,
                          ]);
                    }}
                    style={{
                      width: 80,
                      height: 25,
                      backgroundColor: isInvited ? LIGHTPURPLE : PURPLE,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 12,
                    }}>
                    <Caption
                      style={{
                        color: isInvited ? PURPLE : WHITE,
                        fontWeight: '700',
                      }}>
                      {isInvited ? '추가 완료' : '추가'}
                    </Caption>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListFooterComponent={() => (
              <BottomButton label="등록" onPress={onCreate} />
            )}
            ListFooterComponentStyle={{ marginTop: 20 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <DatePicker
        modal
        open={show}
        onConfirm={date => {
          setShow(false);
          handleInputChange('date', date);
        }}
        onCancel={() => setShow(false)}
        date={feed.date}
        mode="date"
        minimumDate={new Date(1970, 1)}
        maximumDate={new Date()}
        locale="ko"
      />
      <Modal visible={postModal}>
        <SafeAreaView>
          <CustomHeader
            label="장소 검색"
            onClose={() => {
              setPostModal(false);
            }}
          />
          <Postcode
            style={{ width: width, height: height - 100, marginTop: 100 }}
            onError={() => {
              Alert.alert('주소 검색에 실패하였습니다.');
            }}
            jsOptions={{ animation: true, hideMapBtn: true }}
            onSelected={data => {
              handleInputChange('location', data.address);
              setPostModal(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};
const PhotoBox = styled.View`
  margin: 5px 0px;
  border-radius: 2px;
  border: 1px solid ${GRAY};
  width: 100%;
  height: 180px;
  justify-content: center;
  align-items: center;
  align-self: center;
`;

export default FeedUpload;
