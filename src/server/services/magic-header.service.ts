// Custom 4-byte Magic Number Service
export class MagicHeaderService {
  /**
   * Cleans and validates a 4-byte hex string (e.g., "7F50564D" or "0x7f, 0x50, 0x56, 0x4d")
   */
  public static sanitizeMagicHex(input: string): string {
    const withoutPrefix = input.replace(/0x/gi, '');
    const cleaned = withoutPrefix.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (cleaned.length < 8) {
      return cleaned.padEnd(8, '0');
    }
    return cleaned.slice(0, 8);
  }

  /**
   * Converts a 4-byte hex string to byte array
   */
  public static hexToBytes(hex: string): number[] {
    const clean = this.sanitizeMagicHex(hex);
    const bytes: number[] = [];
    for (let i = 0; i < 8; i += 2) {
      bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }
    return bytes;
  }

  /**
   * Formats byte array as Python byte literal string (e.g. b"\\x7f\\x50\\x56\\x4d")
   */
  public static toPythonBytesLiteral(hex: string): string {
    const bytes = this.hexToBytes(hex);
    return 'b"' + bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('') + '"';
  }

  /**
   * Generates readable ASCII representation if printable
   */
  public static toAscii(hex: string): string {
    const bytes = this.hexToBytes(hex);
    return bytes
      .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '·'))
      .join('');
  }
}
