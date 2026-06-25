### 0624
- 기능 모듈화 (intro / loading / result)
- 디자인 세부 조정 (페이드인 애니메이션 + Interactive 별 배경)
- 웹용 디자인 먼저
- 웹폰트 사용
	- 제목 폰트: JeongseonArirangHon 적용

		IntroScreen: .title

		ResultScreen: .summary

	- 본문 텍스트 폰트: GyeonggiMillenniumBackground 적용

		IntroScreen: .subtitle, .btn, .hint

		LoadingScreen: .hint

		ResultScreen: .analysis p, .resetBtn

### 0625
- IntroScreen 초안 완성
	- 첫 화면 별 interaction
	- 첫 화면 페이드인 애니메이션
	- 키보드 입력 시 텍스트박스 출현
	- 엔터 입력 시 dreamtext로 page.tsx에 내용 저장 후 전달