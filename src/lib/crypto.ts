import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // Must be 32 chars
const iv = crypto.randomBytes(16);

export const encrypt = (text: string) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

export const decrypt = (hash: { iv: string, content: string }) => {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};
