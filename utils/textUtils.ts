import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const isTablet = screenWidth >= 768;

export const cropTextForDevice = (text: string, phoneLength: number = 20): string => {
  if (isTablet || text.length <= phoneLength) return text;
  return text.slice(0, phoneLength).trim() + '...';
};