import MapView, { LatLng, Marker } from 'react-native-maps';
import { AlbumLocationProps, AlbumPlaceItem } from '../Group/Album/AlbumItem';

interface MapProps {
  navigation: any;
  places: AlbumLocationProps[];
}

const Map = ({ navigation, places }: MapProps) => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 35.6,
        longitude: 127.6,
        latitudeDelta: 4,
        longitudeDelta: 4,
      }}
      zoomEnabled={true}>
      {places.map((marker: AlbumLocationProps, index: number) => (
        <Marker
          key={index}
          coordinate={{
            latitude: parseFloat(marker.x),
            longitude: parseFloat(marker.y),
          }}>
          <AlbumPlaceItem
            navigation={navigation}
            image={marker.albumImage}
            albumIdx={marker.albumIdx}
          />
        </Marker>
      ))}
    </MapView>
  );
};

export default Map;
