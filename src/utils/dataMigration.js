/**
 * Firebase 데이터 마이그레이션 유틸리티
 *
 * 마이그레이션 항목:
 * 1. rating 필드 초기화 - 피드백 시스템 지원
 * 2. visibility 필드 추가 - 기존 isPublic을 visibility로 정규화
 * 3. jenny 필드 기본값 - 이전 버전 문서 호환
 * 4. fortunes → sajus 컬렉션 마이그레이션 - 리브랜딩
 * 5. keywords → tags 정규화 - SEO/태그 시스템
 *
 * 사용법: 관리자 페이지나 콘솔에서 실행
 * import { runMigration, migrateFortuneToSaju, migrateKeywordsToTags } from './utils/dataMigration';
 * await runMigration('dreams', 'all');
 * await migrateFortuneToSaju({ dryRun: true });
 * await migrateKeywordsToTags('dreams', { dryRun: true });
 */

import { collection, getDocs, doc, writeBatch, query, limit, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { extractTags } from './tagUtils';

// 마이그레이션 버전
const MIGRATION_VERSION = 1;

/**
 * rating 필드 초기화
 * @param {Object} docData - 문서 데이터
 * @returns {Object|null} - 업데이트할 필드 또는 null (업데이트 불필요)
 */
const migrateRating = (docData) => {
    if (docData.rating !== undefined) return null; // 이미 있음

    return {
        rating: {
            count: 0,
            total: 0,
            ratings: [],
            lastRating: null,
            lastRatedAt: null
        }
    };
};

/**
 * visibility 필드 정규화
 * @param {Object} docData - 문서 데이터
 * @returns {Object|null} - 업데이트할 필드 또는 null
 */
const migrateVisibility = (docData) => {
    if (docData.visibility !== undefined) return null; // 이미 있음

    // isPublic 기반으로 visibility 설정
    const isPublic = docData.isPublic === true;
    return {
        visibility: isPublic ? 'public' : 'private',
        isAnonymous: docData.isAnonymous || false
    };
};

/**
 * jenny 필드 기본값 설정
 * @param {Object} docData - 문서 데이터
 * @returns {Object|null} - 업데이트할 필드 또는 null
 */
const migrateJenny = (docData) => {
    if (docData.jenny !== undefined) return null; // 이미 있음

    // 기본 jenny 구조 (이전 버전 호환)
    return {
        jenny: {
            hook: docData.verdict || '',
            foreshadow: '',
            bonus: '',
            hiddenInsight: '',
            shareHook: '',
            twist: null
        }
    };
};

/**
 * 마이그레이션 버전 필드 추가
 * @param {Object} docData - 문서 데이터
 * @returns {Object|null} - 업데이트할 필드 또는 null
 */
const migrateMigrationVersion = (docData) => {
    if (docData._migrationVersion >= MIGRATION_VERSION) return null;

    return {
        _migrationVersion: MIGRATION_VERSION
    };
};

/**
 * 단일 문서 마이그레이션
 * @param {string} collectionName - 컬렉션 이름
 * @param {string} docId - 문서 ID
 * @param {Object} docData - 문서 데이터
 * @param {string[]} migrations - 적용할 마이그레이션 목록
 * @returns {Object|null} - 업데이트할 필드 통합 객체
 */
const getMigrationUpdates = (docData, migrations = ['rating', 'visibility', 'jenny', 'version']) => {
    const updates = {};
    let hasUpdates = false;

    if (migrations.includes('rating')) {
        const ratingUpdate = migrateRating(docData);
        if (ratingUpdate) {
            Object.assign(updates, ratingUpdate);
            hasUpdates = true;
        }
    }

    if (migrations.includes('visibility')) {
        const visibilityUpdate = migrateVisibility(docData);
        if (visibilityUpdate) {
            Object.assign(updates, visibilityUpdate);
            hasUpdates = true;
        }
    }

    if (migrations.includes('jenny')) {
        const jennyUpdate = migrateJenny(docData);
        if (jennyUpdate) {
            Object.assign(updates, jennyUpdate);
            hasUpdates = true;
        }
    }

    if (migrations.includes('version')) {
        const versionUpdate = migrateMigrationVersion(docData);
        if (versionUpdate) {
            Object.assign(updates, versionUpdate);
            hasUpdates = true;
        }
    }

    return hasUpdates ? updates : null;
};

/**
 * 컬렉션 마이그레이션 실행
 * @param {string} collectionName - 'dreams' | 'tarots' | 'sajus'
 * @param {string} migrationType - 'rating' | 'visibility' | 'jenny' | 'all'
 * @param {Object} options - { dryRun: boolean, batchSize: number }
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export const runMigration = async (collectionName, migrationType = 'all', options = {}) => {
    const { dryRun = false, batchSize = 500 } = options;

    console.log(`🔄 Starting migration: ${collectionName} - ${migrationType} (dryRun: ${dryRun})`);

    const migrations = migrationType === 'all'
        ? ['rating', 'visibility', 'jenny', 'version']
        : [migrationType, 'version'];

    try {
        const q = query(collection(db, collectionName), limit(batchSize));
        const snapshot = await getDocs(q);

        console.log(`📊 Found ${snapshot.docs.length} documents in ${collectionName}`);

        let updated = 0;
        let skipped = 0;
        const errors = [];

        if (dryRun) {
            // 드라이런: 업데이트 대상만 확인
            for (const docSnap of snapshot.docs) {
                const updates = getMigrationUpdates(docSnap.data(), migrations);
                if (updates) {
                    console.log(`  [DRY] Would update ${docSnap.id}:`, Object.keys(updates));
                    updated++;
                } else {
                    skipped++;
                }
            }
        } else {
            // 실제 마이그레이션: 배치 쓰기 사용
            const batch = writeBatch(db);
            let batchCount = 0;

            for (const docSnap of snapshot.docs) {
                const updates = getMigrationUpdates(docSnap.data(), migrations);
                if (updates) {
                    try {
                        batch.update(doc(db, collectionName, docSnap.id), updates);
                        batchCount++;
                        updated++;

                        // 배치 크기 제한 (500개)
                        if (batchCount >= 500) {
                            await batch.commit();
                            console.log(`  ✅ Committed batch of ${batchCount} updates`);
                            batchCount = 0;
                        }
                    } catch (err) {
                        errors.push({ id: docSnap.id, error: err.message });
                    }
                } else {
                    skipped++;
                }
            }

            // 남은 배치 커밋
            if (batchCount > 0) {
                await batch.commit();
                console.log(`  ✅ Committed final batch of ${batchCount} updates`);
            }
        }

        const result = {
            collection: collectionName,
            migrationType,
            dryRun,
            total: snapshot.docs.length,
            updated,
            skipped,
            errors
        };

        console.log(`✅ Migration complete:`, result);
        return result;

    } catch (err) {
        console.error(`❌ Migration failed:`, err);
        throw err;
    }
};

/**
 * 모든 컬렉션 마이그레이션
 * @param {string} migrationType - 'rating' | 'visibility' | 'jenny' | 'all'
 * @param {Object} options - { dryRun: boolean }
 */
export const runFullMigration = async (migrationType = 'all', options = {}) => {
    const collections = ['dreams', 'tarots', 'sajus'];
    const results = [];

    for (const col of collections) {
        const result = await runMigration(col, migrationType, options);
        results.push(result);
    }

    return results;
};

/**
 * 마이그레이션 상태 확인
 * @param {string} collectionName - 컬렉션 이름
 * @returns {Promise<Object>} - 상태 정보
 */
export const checkMigrationStatus = async (collectionName) => {
    const q = query(collection(db, collectionName), limit(100));
    const snapshot = await getDocs(q);

    let withRating = 0;
    let withVisibility = 0;
    let withJenny = 0;
    let migrated = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.rating !== undefined) withRating++;
        if (data.visibility !== undefined) withVisibility++;
        if (data.jenny !== undefined) withJenny++;
        if (data._migrationVersion >= MIGRATION_VERSION) migrated++;
    }

    return {
        collection: collectionName,
        sampleSize: snapshot.docs.length,
        withRating,
        withVisibility,
        withJenny,
        migrated,
        migrationVersion: MIGRATION_VERSION
    };
};

/**
 * ============================================
 * fortunes → sajus 컬렉션 마이그레이션
 * ============================================
 * 레거시 fortunes 컬렉션의 문서를 sajus로 복사
 * 원본 문서는 유지하거나 삭제 선택 가능
 *
 * @param {Object} options
 * @param {boolean} options.dryRun - true면 실제 쓰기 없이 미리보기
 * @param {boolean} options.deleteOriginal - true면 복사 후 원본 삭제
 * @param {number} options.batchSize - 배치 크기 (기본 500)
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export const migrateFortuneToSaju = async (options = {}) => {
    const { dryRun = false, deleteOriginal = false, batchSize = 500 } = options;

    console.log(`🔄 Starting fortunes → sajus migration (dryRun: ${dryRun}, deleteOriginal: ${deleteOriginal})`);

    try {
        // fortunes 컬렉션 읽기
        const fortunesQuery = query(collection(db, 'fortunes'), limit(batchSize));
        const fortunesSnap = await getDocs(fortunesQuery);

        if (fortunesSnap.empty) {
            console.log('📭 No documents found in fortunes collection');
            return { total: 0, migrated: 0, errors: [] };
        }

        console.log(`📊 Found ${fortunesSnap.docs.length} documents in fortunes`);

        let migrated = 0;
        let skipped = 0;
        const errors = [];

        if (dryRun) {
            // 드라이런: 미리보기만
            for (const docSnap of fortunesSnap.docs) {
                const data = docSnap.data();
                console.log(`  [DRY] Would migrate: ${docSnap.id}`, {
                    title: data.title,
                    userId: data.userId,
                    type: data.type || data.fortuneType
                });
                migrated++;
            }
        } else {
            // 실제 마이그레이션
            for (const docSnap of fortunesSnap.docs) {
                try {
                    const data = docSnap.data();
                    const newDocRef = doc(db, 'sajus', docSnap.id);

                    // sajus 컬렉션에 복사 (type 필드 업데이트)
                    await setDoc(newDocRef, {
                        ...data,
                        type: 'saju',  // fortune → saju
                        _migratedFrom: 'fortunes',
                        _migratedAt: new Date()
                    });

                    // 원본 삭제 옵션
                    if (deleteOriginal) {
                        await deleteDoc(doc(db, 'fortunes', docSnap.id));
                    }

                    migrated++;
                    console.log(`  ✅ Migrated: ${docSnap.id}`);
                } catch (err) {
                    errors.push({ id: docSnap.id, error: err.message });
                    console.error(`  ❌ Failed: ${docSnap.id}`, err.message);
                }
            }
        }

        const result = {
            from: 'fortunes',
            to: 'sajus',
            dryRun,
            deleteOriginal,
            total: fortunesSnap.docs.length,
            migrated,
            skipped,
            errors
        };

        console.log(`✅ Fortune → Saju migration complete:`, result);
        return result;

    } catch (err) {
        console.error(`❌ Fortune → Saju migration failed:`, err);
        throw err;
    }
};

/**
 * ============================================
 * keywords → tags 정규화 마이그레이션
 * ============================================
 * 기존 keywords 배열을 정규화된 tags 배열로 변환
 * keywords는 유지하고 tags 필드만 추가
 *
 * @param {string} collectionName - 'dreams' | 'tarots' | 'sajus'
 * @param {Object} options
 * @param {boolean} options.dryRun - true면 실제 쓰기 없이 미리보기
 * @param {number} options.batchSize - 배치 크기 (기본 500)
 * @returns {Promise<Object>} - 마이그레이션 결과
 */
export const migrateKeywordsToTags = async (collectionName, options = {}) => {
    const { dryRun = false, batchSize = 500 } = options;

    console.log(`🔄 Starting keywords → tags migration for ${collectionName} (dryRun: ${dryRun})`);

    try {
        const q = query(collection(db, collectionName), limit(batchSize));
        const snapshot = await getDocs(q);

        console.log(`📊 Found ${snapshot.docs.length} documents in ${collectionName}`);

        let updated = 0;
        let skipped = 0;
        const errors = [];

        if (dryRun) {
            // 드라이런: 미리보기
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // 이미 tags가 있으면 스킵
                if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
                    skipped++;
                    continue;
                }

                // keywords에서 tags 추출
                const tags = extractTags(data.keywords);
                if (tags.length > 0) {
                    console.log(`  [DRY] Would add tags to ${docSnap.id}:`, tags);
                    updated++;
                } else {
                    skipped++;
                }
            }
        } else {
            // 실제 마이그레이션: 배치 쓰기
            const batch = writeBatch(db);
            let batchCount = 0;

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // 이미 tags가 있으면 스킵
                if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
                    skipped++;
                    continue;
                }

                // keywords에서 tags 추출
                const tags = extractTags(data.keywords);
                if (tags.length > 0) {
                    try {
                        batch.update(doc(db, collectionName, docSnap.id), { tags });
                        batchCount++;
                        updated++;

                        // 배치 크기 제한
                        if (batchCount >= 500) {
                            await batch.commit();
                            console.log(`  ✅ Committed batch of ${batchCount} updates`);
                            batchCount = 0;
                        }
                    } catch (err) {
                        errors.push({ id: docSnap.id, error: err.message });
                    }
                } else {
                    skipped++;
                }
            }

            // 남은 배치 커밋
            if (batchCount > 0) {
                await batch.commit();
                console.log(`  ✅ Committed final batch of ${batchCount} updates`);
            }
        }

        const result = {
            collection: collectionName,
            migrationType: 'keywords-to-tags',
            dryRun,
            total: snapshot.docs.length,
            updated,
            skipped,
            errors
        };

        console.log(`✅ Keywords → Tags migration complete:`, result);
        return result;

    } catch (err) {
        console.error(`❌ Keywords → Tags migration failed:`, err);
        throw err;
    }
};

/**
 * 모든 컬렉션에 keywords → tags 마이그레이션 실행
 * @param {Object} options - { dryRun: boolean }
 */
export const migrateAllKeywordsToTags = async (options = {}) => {
    const collections = ['dreams', 'tarots', 'sajus'];
    const results = [];

    for (const col of collections) {
        const result = await migrateKeywordsToTags(col, options);
        results.push(result);
    }

    return results;
};

/**
 * 마이그레이션 통계 확인
 * @param {string} collectionName - 컬렉션 이름
 */
export const checkTagsMigrationStatus = async (collectionName) => {
    const q = query(collection(db, collectionName), limit(100));
    const snapshot = await getDocs(q);

    let withTags = 0;
    let withKeywords = 0;
    let needsMigration = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
            withTags++;
        }
        if (data.keywords && Array.isArray(data.keywords) && data.keywords.length > 0) {
            withKeywords++;
            if (!data.tags || data.tags.length === 0) {
                needsMigration++;
            }
        }
    }

    return {
        collection: collectionName,
        sampleSize: snapshot.docs.length,
        withTags,
        withKeywords,
        needsMigration
    };
};

// 개발 환경에서 글로벌 접근 가능하게
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    window.dataMigration = {
        runMigration,
        runFullMigration,
        checkMigrationStatus,
        migrateFortuneToSaju,
        migrateKeywordsToTags,
        migrateAllKeywordsToTags,
        checkTagsMigrationStatus
    };
    console.log('💡 Data migration available: window.dataMigration');
}
