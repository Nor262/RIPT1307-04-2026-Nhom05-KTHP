// Mock the constant service before importing utils to prevent undefined global errors in test environment
jest.mock('@/services/base/constant', () => ({
  EDinhDangFile: {
    WORD: 'WORD',
    EXCEL: 'EXCEL',
    POWERPOINT: 'POWERPOINT',
    PDF: 'PDF',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    TEXT: 'TEXT',
    UNKNOWN: 'UNKNOWN',
  },
}));

// Mock moment to avoid import resolution issues in test runtime
jest.mock('moment', () => ({
  __esModule: true,
  default: {
    isMoment: () => false,
  },
  isMoment: () => false,
}));

import { isUrl, Format, chuanHoaTen, getNameFile, ellipse, removeHtmlTags } from './utils';

describe('Web Utility Functions', () => {
  describe('isUrl', () => {
    it('should return true for valid HTTP and HTTPS URLs', () => {
      expect(isUrl('http://google.com')).toBe(true);
      expect(isUrl('https://ptit.edu.vn/path/to/page?query=1')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isUrl('invalid-url-string')).toBe(false);
      expect(isUrl('ftp://fileserver.com')).toBe(false);
    });
  });

  describe('Format', () => {
    it('should convert accented Vietnamese strings to lowercase and strip accents', () => {
      expect(Format('Phạm Xuân Công')).toBe('pham xuan cong');
      expect(Format('Đăng ký mượn thiết bị')).toBe('dang ky muon thiet bi');
    });

    it('should return empty string for null or empty input', () => {
      expect(Format('')).toBe('');
      // @ts-ignore
      expect(Format(null)).toBe('');
    });
  });

  describe('chuanHoaTen', () => {
    it('should capitalize the first letter of each word and trim multiple spaces', () => {
      expect(chuanHoaTen('   phạm   xuân   công   ')).toBe('Phạm Xuân Công');
      expect(chuanHoaTen('trần văn hoàng')).toBe('Trần Văn Hoàng');
    });
  });

  describe('getNameFile', () => {
    it('should extract file name from path or url', () => {
      expect(getNameFile('/uploads/images/avatar.png')).toBe('avatar.png');
      expect(getNameFile('https://server.com/documents/report_2026.pdf')).toBe('report_2026.pdf');
    });

    it('should return feedback for non-string input', () => {
      // @ts-ignore
      expect(getNameFile(12345)).toBe('Đường dẫn không đúng');
    });
  });

  describe('ellipse', () => {
    it('should truncate string and append ellipsis if length exceeds limit', () => {
      expect(ellipse('Thiết bị máy tính xách tay Dell XPS', 15)).toBe('Thiết bị máy tí...');
    });

    it('should return original string if within limit', () => {
      expect(ellipse('Dell XPS', 15)).toBe('Dell XPS');
    });
  });

  describe('removeHtmlTags', () => {
    it('should strip HTML tags from a markup string', () => {
      expect(removeHtmlTags('<p>Thiết bị <strong>được bảo trì</strong></p>')).toBe('Thiết bị được bảo trì');
    });

    it('should handle strings without HTML tags', () => {
      expect(removeHtmlTags('Bản báo cáo kỹ thuật')).toBe('Bản báo cáo kỹ thuật');
    });
  });
});
