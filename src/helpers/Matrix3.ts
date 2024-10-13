export class Matrix3 {
  private values: number[];

  constructor() {
    // Initialize with identity matrix
    this.values = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  translate(tx: number, ty: number): void {
    const [a, b, c, d, e, f, g, h, i] = this.values;
    this.values = [
      a,
      b,
      c,
      d,
      e,
      f,
      a * tx + d * ty + g,
      b * tx + e * ty + h,
      c * tx + f * ty + i,
    ];
  }

  scale(sx: number, sy: number): void {
    const [a, b, c, d, e, f, g, h, i] = this.values;
    this.values = [a * sx, b * sx, c * sx, d * sy, e * sy, f * sy, g, h, i];
  }

  multiply(other: Matrix3): void {
    const a = this.values;
    const b = other.values;
    this.values = [
      a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
      a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
      a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
      a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
      a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
      a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
      a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
      a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
      a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    ];
  }

  invert(): Matrix3 | null {
    const [a, b, c, d, e, f, g, h, i] = this.values;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    if (det === 0) {
      return null; // Matrix is not invertible
    }

    const invDet = 1 / det;
    const result = new Matrix3();
    result.values = [
      (e * i - f * h) * invDet,
      (c * h - b * i) * invDet,
      (b * f - c * e) * invDet,
      (f * g - d * i) * invDet,
      (a * i - c * g) * invDet,
      (c * d - a * f) * invDet,
      (d * h - e * g) * invDet,
      (b * g - a * h) * invDet,
      (a * e - b * d) * invDet,
    ];

    return result;
  }

  get(): number[] {
    return [...this.values];
  }
}
