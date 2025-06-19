import path from 'path';
import fs from 'fs';

/**
 * 보안 유틸리티 함수들
 */

/**
 * 파일 경로 검증 및 정규화
 * @param {string} filePath - 검증할 파일 경로
 * @param {string} rootDir - 허용된 루트 디렉토리
 * @returns {string} - 안전한 절대 경로
 * @throws {Error} - 유효하지 않은 경로인 경우
 */
export function validateAndNormalizePath(filePath, rootDir = process.cwd()) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('파일 경로가 제공되지 않았습니다.');
    }

    // 절대 경로로 변환
    const absolutePath = path.isAbsolute(filePath) 
        ? path.resolve(filePath)
        : path.resolve(rootDir, filePath);

    // 정규화하여 ../, ./ 등 처리
    const normalizedPath = path.normalize(absolutePath);

    // 루트 디렉토리 밖으로 나가는지 확인 (Path Traversal 방지)
    const resolvedRoot = path.resolve(rootDir);
    if (!normalizedPath.startsWith(resolvedRoot + path.sep) && normalizedPath !== resolvedRoot) {
        throw new Error(`허용되지 않은 경로입니다: ${filePath}`);
    }

    return normalizedPath;
}

/**
 * 허용된 파일 확장자인지 확인
 * @param {string} filePath - 확인할 파일 경로
 * @param {string[]} allowedExtensions - 허용된 확장자 배열
 * @returns {boolean} - 허용된 확장자인지 여부
 */
export function isAllowedFileExtension(filePath, allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.java', '.c', '.cpp', '.h', '.css', '.html', '.xml', '.yaml', '.yml']) {
    const extension = path.extname(filePath).toLowerCase();
    return allowedExtensions.includes(extension);
}

/**
 * 파일 크기 제한 확인
 * @param {string} filePath - 확인할 파일 경로
 * @param {number} maxSizeInMB - 최대 파일 크기 (MB)
 * @returns {boolean} - 크기 제한 내인지 여부
 */
export function isFileSizeAllowed(filePath, maxSizeInMB = 10) {
    try {
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        return fileSizeInMB <= maxSizeInMB;
    } catch (error) {
        return false;
    }
}

/**
 * 사용자 입력 문자열 정제
 * @param {string} input - 정제할 입력 문자열
 * @returns {string} - 정제된 문자열
 */
export function sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // 위험한 문자 제거
    return input
        .replace(/[<>]/g, '') // HTML 태그 방지
        .replace(/[&]/g, '&amp;') // HTML 엔티티 변환
        .replace(/[\x00-\x1f\x7f]/g, '') // 제어 문자 제거
        .trim();
}

/**
 * 디렉토리 접근 가능 여부 확인
 * @param {string} dirPath - 확인할 디렉토리 경로
 * @returns {boolean} - 접근 가능한지 여부
 */
export function isDirectoryAccessible(dirPath) {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}