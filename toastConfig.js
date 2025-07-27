import { Dimensions } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#10B981',
        paddingVertical: isTablet ? 16 : 12,
      }}
      text1Style={{
        fontSize: isTablet ? 18 : 14,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: isTablet ? 16 : 12,
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#EF4444',
        paddingVertical: isTablet ? 16 : 12,
      }}
      text1Style={{
        fontSize: isTablet ? 18 : 14,
        fontWeight: '600',
      }}
      text2Style={{
        fontSize: isTablet ? 16 : 12,
      }}
    />
  ),
};