/**
 * English translation file
 */

export default {
    // Common
    common: {
        appName: 'JeomAI',
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        skip: 'Skip',
        done: 'Done',
        share: 'Share',
        copy: 'Copy',
        copied: 'Copied!',
        more: 'More',
        less: 'Less',
        all: 'All',
        none: 'None',
        yes: 'Yes',
        no: 'No',
        submit: 'Submit',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        settings: 'Settings',
        help: 'Help',
        logout: 'Log out',
        login: 'Log in',
        signup: 'Sign up'
    },

    // Navigation
    nav: {
        home: 'Home',
        dream: 'Dreams',
        tarot: 'Tarot',
        saju: 'Fortune',
        mypage: 'My Page',
        feed: 'Feed',
        settings: 'Settings'
    },

    // Home
    home: {
        greeting: 'Hello!',
        todayFortune: "Today's Fortune",
        quickStart: 'Quick Start',
        recentReadings: 'Recent Readings',
        popularTags: 'Popular Tags',
        noReadings: 'No readings yet'
    },

    // Dream Interpretation
    dream: {
        title: 'Dream Interpretation',
        subtitle: 'AI analyzes the meaning of your dreams',
        inputPlaceholder: 'Describe your dream in detail...',
        inputHint: 'Include what you saw, how you felt, and any people that appeared.',
        analyze: 'Analyze Dream',
        analyzing: 'Analyzing your dream...',
        result: {
            interpretation: 'Interpretation',
            symbols: 'Symbol Analysis',
            message: 'Message',
            advice: 'Advice',
            keywords: 'Keywords'
        },
        examples: {
            title: 'Example Dreams',
            falling: 'Falling from a height',
            flying: 'Flying in the sky',
            teeth: 'Losing teeth',
            water: 'Being underwater'
        }
    },

    // Tarot
    tarot: {
        title: 'Tarot Reading',
        subtitle: 'Discover the message from the cards',
        selectSpread: 'Select Spread',
        spreads: {
            single: 'Single Card',
            threeCard: 'Three Card',
            celtic: 'Celtic Cross',
            love: 'Love Spread'
        },
        question: 'Question',
        questionPlaceholder: 'What would you like to ask the cards?',
        drawCards: 'Draw Cards',
        drawing: 'Drawing cards...',
        result: {
            position: 'Position',
            card: 'Card',
            meaning: 'Meaning',
            advice: 'Advice',
            overall: 'Overall Reading'
        },
        positions: {
            card1: 'First Card',
            card2: 'Second Card',
            card3: 'Third Card',
            // Legacy compatibility
            past: 'Past',
            present: 'Present',
            future: 'Future',
            situation: 'Current Situation',
            challenge: 'Challenge',
            goal: 'Goal',
            foundation: 'Foundation',
            recent: 'Recent Past',
            attitude: 'Attitude',
            environment: 'Environment',
            hopes: 'Hopes/Fears',
            outcome: 'Outcome'
        }
    },

    // Saju (Four Pillars)
    saju: {
        title: 'Fortune Analysis',
        subtitle: 'Discover your destiny through birth date',
        birthInfo: 'Birth Date & Time',
        year: 'Year',
        month: 'Month',
        day: 'Day',
        hour: 'Hour',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        unknownTime: "I don't know my birth time",
        analyze: 'Analyze Fortune',
        analyzing: 'Analyzing your fortune...',
        result: {
            overview: 'Overview',
            personality: 'Personality',
            career: 'Career & Wealth',
            love: 'Love & Marriage',
            health: 'Health',
            monthly: 'Monthly Fortune',
            yearly: 'This Year'
        },
        elements: {
            wood: 'Wood',
            fire: 'Fire',
            earth: 'Earth',
            metal: 'Metal',
            water: 'Water'
        }
    },

    // My Page
    mypage: {
        title: 'My Page',
        profile: 'Profile',
        nickname: 'Nickname',
        points: 'Points',
        readings: 'Reading History',
        favorites: 'Favorites',
        settings: 'Settings',
        premium: 'Premium',
        referral: 'Invite Friends',
        feedback: 'Feedback',
        stats: {
            totalReadings: 'Total Readings',
            thisMonth: 'This Month',
            streak: 'Day Streak'
        }
    },

    // Points/Readings
    points: {
        title: 'Points',
        remaining: 'Readings Left',
        readings: '',
        free: 'Free',
        bonus: 'Bonus',
        daily: 'Daily Bonus',
        referral: 'Referral Bonus',
        event: 'Event Bonus',
        premium: 'Premium',
        getPremium: 'Get Premium',
        unlimited: 'Unlimited',
        history: 'Usage History'
    },

    // Share
    share: {
        title: 'Share',
        copyLink: 'Copy Link',
        kakao: 'KakaoTalk',
        twitter: 'X (Twitter)',
        facebook: 'Facebook',
        instagram: 'Instagram',
        more: 'More',
        message: {
            dream: 'Check out my dream interpretation!',
            tarot: 'Curious about tarot reading results?',
            saju: 'Sharing my fortune analysis'
        }
    },

    // Onboarding
    onboarding: {
        welcome: {
            title: 'Welcome to JeomAI!',
            subtitle: 'AI reveals your fortune'
        },
        features: {
            title: 'What would you like to try?',
            dream: {
                title: 'Dream Interpretation',
                desc: 'Analyze your dream meanings'
            },
            tarot: {
                title: 'Tarot Reading',
                desc: 'Messages from the cards'
            },
            saju: {
                title: 'Fortune Analysis',
                desc: 'Your destiny revealed'
            }
        },
        howto: {
            title: 'How it works',
            step1: {
                title: 'Choose Service',
                desc: 'Select dream, tarot, or fortune'
            },
            step2: {
                title: 'Enter Info',
                desc: 'Describe your dream or enter birth date'
            },
            step3: {
                title: 'AI Analysis',
                desc: 'Get in-depth AI analysis'
            }
        },
        profile: {
            title: 'Set up your profile for',
            benefits: [
                'Personalized readings',
                'Save your history',
                'Referral bonuses'
            ]
        },
        gift: {
            title: 'Welcome Gift',
            subtitle: 'Free readings for you!',
            claim: 'Claim Gift'
        }
    },

    // Notifications
    notifications: {
        title: 'Notification Settings',
        enable: 'Enable Notifications',
        morning: 'Morning Fortune',
        morningDesc: "Get your daily fortune every morning",
        evening: 'Evening Dream Reminder',
        eveningDesc: 'Reminder to record your dreams',
        newFeatures: 'New Features & Events',
        newFeaturesDesc: 'Get notified about new features and events',
        testBtn: 'Send Test Notification',
        permissionDenied: 'Notifications are blocked. Please enable in browser settings.',
        permissionRequest: {
            title: 'Would you like notifications?',
            desc: 'Get daily fortune updates and dream reminders.',
            allow: 'Allow Notifications'
        }
    },

    // Referral
    referral: {
        title: 'Invite Friends',
        subtitle: 'Invite friends and get free readings',
        myCode: 'My Invite Code',
        enterCode: 'Enter Code',
        enterCodePlaceholder: 'Enter code',
        apply: 'Apply',
        share: 'Send Invitation',
        rewards: {
            inviter: 'Your Reward',
            invitee: 'Friend Gets',
            readings: '{count} free readings'
        },
        stats: {
            invited: 'Friends Invited',
            earned: 'Readings Earned'
        },
        messages: {
            success: 'Invite code applied successfully!',
            invalid: 'Invalid code',
            alreadyUsed: 'Code already used',
            selfCode: "You can't use your own code"
        }
    },

    // Feedback
    feedback: {
        title: 'Feedback',
        subtitle: 'Help us improve',
        type: {
            bug: 'Bug Report',
            feature: 'Feature Request',
            content: 'Content Improvement',
            other: 'Other'
        },
        placeholder: 'Share your thoughts...',
        submit: 'Send Feedback',
        thanks: 'Thank you for your feedback!'
    },

    // Errors
    errors: {
        network: 'Network error occurred',
        server: 'Server error occurred',
        auth: 'Authentication required',
        permission: 'Permission denied',
        notFound: 'Not found',
        generic: 'Something went wrong. Please try again.',
        inputRequired: 'Please enter some content',
        inputTooShort: 'Please enter at least {min} characters',
        inputTooLong: 'Please enter no more than {max} characters',
        noReadingsLeft: 'No readings remaining'
    },

    // Time
    time: {
        justNow: 'just now',
        minutesAgo: '{n}m ago',
        hoursAgo: '{n}h ago',
        daysAgo: '{n}d ago',
        weeksAgo: '{n}w ago',
        monthsAgo: '{n}mo ago',
        yearsAgo: '{n}y ago'
    },

    // Seasonal Events
    events: {
        lunarNewYear: 'Lunar New Year Event',
        valentine: 'Valentine Event',
        whiteDay: 'White Day Event',
        christmas: 'Christmas Event',
        newYear: 'New Year Event',
        chuseok: 'Chuseok Event',
        halloween: 'Halloween Event',
        claimBonus: 'Claim Bonus',
        claimed: 'Bonus claimed!'
    }
};
