import bcrypt from 'bcryptjs';

const plain = process.argv[2] || 'admin123';
const hash = process.argv[3] || await bcrypt.hash(plain, 10);
const match = await bcrypt.compare(plain, hash);

console.log('Plain:', plain);
console.log('Hash:', hash);
console.log('Match?', match);
