/**
 * 한국어 번역 파일
 */

export default {
    // 공통
    common: {
        appName: '점AI',
        loading: '로딩 중...',
        error: '오류가 발생했습니다',
        retry: '다시 시도',
        cancel: '취소',
        confirm: '확인',
        save: '저장',
        delete: '삭제',
        edit: '수정',
        close: '닫기',
        back: '뒤로',
        next: '다음',
        skip: '건너뛰기',
        done: '완료',
        share: '공유',
        copy: '복사',
        copied: '복사됨!',
        more: '더보기',
        less: '접기',
        all: '전체',
        none: '없음',
        yes: '예',
        no: '아니오',
        submit: '제출',
        search: '검색',
        filter: '필터',
        sort: '정렬',
        settings: '설정',
        help: '도움말',
        logout: '로그아웃',
        login: '로그인',
        signup: '회원가입'
    },

    // 네비게이션
    nav: {
        home: '홈',
        dream: '꿈해몽',
        tarot: '타로',
        saju: '사주',
        mypage: '마이페이지',
        feed: '피드',
        settings: '설정'
    },

    // 홈
    home: {
        greeting: '안녕하세요!',
        todayFortune: '오늘의 운세',
        quickStart: '빠른 시작',
        recentReadings: '최근 리딩',
        popularTags: '인기 태그',
        noReadings: '아직 리딩 기록이 없어요'
    },

    // 꿈해몽
    dream: {
        title: '꿈 해몽',
        subtitle: '어젯밤 꾼 꿈을 AI가 분석해드려요',
        inputPlaceholder: '꿈의 내용을 자세히 적어주세요...',
        inputHint: '꿈에서 본 것, 느꼈던 감정, 등장인물 등을 상세히 적어주세요.',
        analyze: '꿈 분석하기',
        analyzing: '꿈을 분석하고 있어요...',
        result: {
            interpretation: '해석',
            symbols: '상징 분석',
            message: '메시지',
            advice: '조언',
            keywords: '키워드'
        },
        examples: {
            title: '예시 꿈',
            falling: '높은 곳에서 떨어지는 꿈',
            flying: '하늘을 나는 꿈',
            teeth: '이가 빠지는 꿈',
            water: '물에 빠지는 꿈'
        }
    },

    // 타로
    tarot: {
        title: '타로 리딩',
        subtitle: '카드가 전하는 메시지를 확인해보세요',
        selectSpread: '스프레드 선택',
        spreads: {
            single: '원 카드',
            threeCard: '쓰리 카드',
            celtic: '켈틱 크로스',
            love: '연애 스프레드'
        },
        question: '질문',
        questionPlaceholder: '타로에게 물어보고 싶은 것을 적어주세요',
        drawCards: '카드 뽑기',
        drawing: '카드를 뽑고 있어요...',
        result: {
            position: '위치',
            card: '카드',
            meaning: '의미',
            advice: '조언',
            overall: '전체 해석'
        },
        positions: {
            card1: '첫 번째 카드',
            card2: '두 번째 카드',
            card3: '세 번째 카드',
            // 레거시 호환
            past: '과거',
            present: '현재',
            future: '미래',
            situation: '현재 상황',
            challenge: '도전',
            goal: '목표',
            foundation: '기반',
            recent: '최근 과거',
            attitude: '태도',
            environment: '환경',
            hopes: '희망/두려움',
            outcome: '결과'
        }
    },

    // 사주
    saju: {
        title: '사주 분석',
        subtitle: '생년월일시로 알아보는 타고난 운명',
        birthInfo: '생년월일시',
        year: '년',
        month: '월',
        day: '일',
        hour: '시',
        gender: '성별',
        male: '남성',
        female: '여성',
        unknownTime: '태어난 시간을 모르겠어요',
        analyze: '사주 분석하기',
        analyzing: '사주를 분석하고 있어요...',
        result: {
            overview: '종합 운세',
            personality: '성격',
            career: '직업/재물운',
            love: '연애/결혼운',
            health: '건강운',
            monthly: '월별 운세',
            yearly: '올해 운세'
        },
        elements: {
            wood: '목',
            fire: '화',
            earth: '토',
            metal: '금',
            water: '수'
        }
    },

    // 마이페이지
    mypage: {
        title: '마이페이지',
        profile: '프로필',
        nickname: '닉네임',
        points: '포인트',
        readings: '리딩 기록',
        favorites: '즐겨찾기',
        settings: '설정',
        premium: '프리미엄',
        referral: '친구 초대',
        feedback: '피드백',
        stats: {
            totalReadings: '총 리딩',
            thisMonth: '이번 달',
            streak: '연속 방문'
        }
    },

    // 포인트/리딩
    points: {
        title: '포인트',
        remaining: '남은 리딩',
        readings: '회',
        free: '무료',
        bonus: '보너스',
        daily: '일일 보너스',
        referral: '초대 보너스',
        event: '이벤트 보너스',
        premium: '프리미엄',
        getPremium: '프리미엄 구독',
        unlimited: '무제한',
        history: '사용 내역'
    },

    // 공유
    share: {
        title: '공유하기',
        copyLink: '링크 복사',
        kakao: '카카오톡',
        twitter: 'X (트위터)',
        facebook: '페이스북',
        instagram: '인스타그램',
        more: '더보기',
        message: {
            dream: '내 꿈 해몽 결과를 확인해보세요!',
            tarot: '타로 리딩 결과가 궁금하다면?',
            saju: '사주 분석 결과를 공유합니다'
        }
    },

    // 온보딩
    onboarding: {
        welcome: {
            title: '점AI에 오신 것을 환영해요!',
            subtitle: 'AI가 당신의 운세를 풀어드려요'
        },
        features: {
            title: '어떤 걸 해볼까요?',
            dream: {
                title: '꿈 해몽',
                desc: '간밤의 꿈 의미 분석'
            },
            tarot: {
                title: '타로 리딩',
                desc: '카드가 전하는 메시지'
            },
            saju: {
                title: '사주 분석',
                desc: '타고난 운명 분석'
            }
        },
        howto: {
            title: '이렇게 이용해요',
            step1: {
                title: '서비스 선택',
                desc: '꿈, 타로, 사주 중 선택'
            },
            step2: {
                title: '정보 입력',
                desc: '꿈 내용이나 생년월일 입력'
            },
            step3: {
                title: 'AI 분석',
                desc: 'AI가 심층 분석해드려요'
            }
        },
        profile: {
            title: '프로필을 설정하면',
            benefits: [
                '맞춤형 운세 제공',
                '리딩 기록 저장',
                '친구 초대 보너스'
            ]
        },
        gift: {
            title: '환영 선물',
            subtitle: '무료 리딩을 드려요!',
            claim: '선물 받기'
        }
    },

    // 알림
    notifications: {
        title: '알림 설정',
        enable: '알림 받기',
        morning: '아침 운세 알림',
        morningDesc: '매일 아침 오늘의 운세를 알려드려요',
        evening: '저녁 꿈 알림',
        eveningDesc: '저녁에 꿈 일기를 기록하라고 알려드려요',
        newFeatures: '새 기능/이벤트 알림',
        newFeaturesDesc: '새로운 기능이나 이벤트 소식을 알려드려요',
        testBtn: '테스트 알림 보내기',
        permissionDenied: '알림이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.',
        permissionRequest: {
            title: '알림을 받아보시겠어요?',
            desc: '매일 아침 오늘의 운세와 저녁에 꿈 해몽 알림을 받을 수 있어요.',
            allow: '알림 허용하기'
        }
    },

    // 레퍼럴
    referral: {
        title: '친구 초대',
        subtitle: '친구를 초대하고 무료 리딩을 받으세요',
        myCode: '내 초대 코드',
        enterCode: '초대 코드 입력',
        enterCodePlaceholder: '코드 입력',
        apply: '적용',
        share: '초대장 보내기',
        rewards: {
            inviter: '초대자 보상',
            invitee: '피초대자 보상',
            readings: '{count}회 무료 리딩'
        },
        stats: {
            invited: '초대한 친구',
            earned: '받은 리딩'
        },
        messages: {
            success: '초대 코드가 적용되었습니다!',
            invalid: '유효하지 않은 코드입니다',
            alreadyUsed: '이미 사용된 코드입니다',
            selfCode: '본인의 코드는 사용할 수 없습니다'
        }
    },

    // 피드백
    feedback: {
        title: '피드백',
        subtitle: '서비스 개선에 참여해주세요',
        type: {
            bug: '버그 신고',
            feature: '기능 제안',
            content: '콘텐츠 개선',
            other: '기타'
        },
        placeholder: '의견을 자유롭게 적어주세요...',
        submit: '피드백 보내기',
        thanks: '소중한 의견 감사합니다!'
    },

    // 에러
    errors: {
        network: '네트워크 오류가 발생했습니다',
        server: '서버 오류가 발생했습니다',
        auth: '인증이 필요합니다',
        permission: '권한이 없습니다',
        notFound: '찾을 수 없습니다',
        generic: '문제가 발생했습니다. 다시 시도해주세요.',
        inputRequired: '내용을 입력해주세요',
        inputTooShort: '{min}자 이상 입력해주세요',
        inputTooLong: '{max}자 이하로 입력해주세요',
        noReadingsLeft: '남은 리딩이 없습니다'
    },

    // 시간
    time: {
        justNow: '방금 전',
        minutesAgo: '{n}분 전',
        hoursAgo: '{n}시간 전',
        daysAgo: '{n}일 전',
        weeksAgo: '{n}주 전',
        monthsAgo: '{n}개월 전',
        yearsAgo: '{n}년 전'
    },

    // 시즌 이벤트
    events: {
        lunarNewYear: '설날 특별 이벤트',
        valentine: '발렌타인 이벤트',
        whiteDay: '화이트데이 이벤트',
        christmas: '크리스마스 이벤트',
        newYear: '새해 맞이 이벤트',
        chuseok: '추석 특별 이벤트',
        halloween: '할로윈 이벤트',
        claimBonus: '보너스 받기',
        claimed: '보너스를 받았어요!'
    }
};
