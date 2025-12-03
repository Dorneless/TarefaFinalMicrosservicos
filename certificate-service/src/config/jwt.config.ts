import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
    secret:
        process.env.JWT_SECRET ||
        'mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLongForHS256Algorithm',
    expiresIn: process.env.JWT_EXPIRATION || '86400000',
}));
