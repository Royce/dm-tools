export type Dice = { seed: (n: number) => Dice; roll: (n: number) => number };

export function rng(s = Math.round(Math.random() * 10000)): Dice {
  var mask = 0xffffffff;
  var m_w = (123456789 + s) & mask;
  var m_z = (987654321 - s) & mask;
  // Returns number between 0 (inclusive) and 1.0 (exclusive),
  // just like Math.random().
  function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  }
  function roll(n: number) {
    return Math.ceil(random() * n);
  }
  function seed(n: number) {
    return rng(s + n);
  }
  return { seed, roll };
}
