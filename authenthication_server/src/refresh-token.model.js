import { Schema, model } from 'mongoose';

const refreshTokenSchema = new Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        familyId: {
            type: String, 
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

refreshTokenSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiresAt;
});

refreshTokenSchema.virtual('isRevoked').get(function () {
    return this.revokedAt !== null && this.revokedAt !== undefined;
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('RefreshToken', refreshTokenSchema);
