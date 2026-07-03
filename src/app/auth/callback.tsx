import { ActivityIndicator, View } from 'react-native';

// OAuth 팝업 콜백 전용 페이지
// Supabase가 토큰을 URL 해시에서 파싱해 localStorage에 저장한 뒤
// _layout.tsx의 window.opener 감지 로직이 팝업을 닫음
export default function AuthCallback() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
